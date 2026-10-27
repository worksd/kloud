'use client';
// 내 정규반 상세 — 수강 내역. GET /regular-classes/:id/tickets?type=past 로 이 반에서 들은 회차를 최근 순으로.
// 지금 패스뿐 아니라 지난 기간 패스·단건 결제 회차까지 담긴다(취소 제외). 첫 페이지는 서버가 실어 주고, 바닥에 닿으면 다음 페이지.
// 행 = 공용 LessonRow + 메인 강사(artists[0]) 이름. 탭하면 수강권 상세.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { convertStatusToMessage, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { chipBase, chipClass, LessonRow, LessonSection } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { getRegularClassTicketsAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.tickets.action";

export const RegularClassHistory = ({ regularClassId, initialTickets, totalPage: initialTotalPage, locale }: {
  regularClassId: number;
  initialTickets: TicketResponse[];
  totalPage: number;
  locale: Locale;
}) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(initialTotalPage);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < totalPage;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getRegularClassTicketsAction({ id: regularClassId, page: nextPage });
    // 실패하면 더 부르지 않는다 (무한 재시도 방지)
    if (!res) {
      setTotalPage(page);
    } else {
      setTickets((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...res.tickets.filter((t) => !seen.has(t.id))];
      });
      setPage(nextPage);
      if (res.totalPage != null) setTotalPage(res.totalPage);
    }
    setIsLoading(false);
  }, [regularClassId, page, isLoading, hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  if (tickets.length === 0) return null;

  return (
    <LessonSection title={getLocaleString({ locale, key: 'regular_class_history' })}>
      {tickets.map((t) => {
        const attended = t.status === 'Used';
        const artist = t.lesson?.artists?.[0];
        return (
          <LessonRow
            key={t.id}
            title={t.lesson?.title ?? ''}
            startDate={t.lesson?.startDate}
            roomName={t.lesson?.room?.name}
            artistName={artist?.name || artist?.nickName}
            locale={locale}
            isPast
            route={KloudScreen.TicketDetail(t.id, false)}
            chip={
              <span className={`${chipBase} ${chipClass[attended ? 'attended' : 'other']}`}>
                {getLocaleString({ locale, key: attended ? 'attendance_attended' : convertStatusToMessage({ status: t.status }) })}
              </span>
            }
          />
        );
      })}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-6">
          {isLoading && <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>}
        </div>
      )}
    </LessonSection>
  );
};
