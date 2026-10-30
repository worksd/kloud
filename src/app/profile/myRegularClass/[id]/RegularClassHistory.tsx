'use client';
// 내 정규반 상세 — 수강 내역. GET /regular-classes/:id/tickets?type=past 로 이 반에서 들은 회차를 최근 순으로.
// 지금 패스뿐 아니라 지난 기간 패스·단건 결제 회차까지 담긴다(취소 제외). 첫 페이지는 서버가 실어 주고, 바닥에 닿으면 다음 페이지.
// 행 = 공용 LessonRow + 메인 강사(artists[0]) 닉네임(없으면 이름). 탭하면 수강권 상세.
// 결제 회차별 조회 — 제목 아래 '< 3회차 · 10.15 ~ 11.14 >' 로 회차를 넘기며 본다. 회차 목록·지난 회차 행은 history.periods.mock.ts(TODO, API 붙이면 교체).
// 다음 페이지 로드는 현재 회차에서만(서버 목록이 회차 구분 없이 최근 순이라).

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { convertStatusToMessage, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { chipBase, chipClass, LessonRow, LessonSection } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { getRegularClassTicketsAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.tickets.action";
import { inPeriod, mockTicketsForPeriod, PaymentPeriod } from "@/app/profile/myRegularClass/[id]/history.periods.mock";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const RegularClassHistory = ({ regularClassId, initialTickets, totalPage: initialTotalPage, periods, days, locale }: {
  regularClassId: number;
  initialTickets: TicketResponse[];
  totalPage: number;
  /** 결제 회차(최신이 앞). 비어 있으면 회차 내비게이션 없이 전체를 그린다 */
  periods: PaymentPeriod[];
  /** 반 요일 — 지난 회차 가짜 행 생성용(목) */
  days: number[];
  locale: Locale;
}) => {
  const [tickets, setTickets] = useState(initialTickets);
  // 보고 있는 회차 — periods 인덱스(0 = 최신/현재)
  const [periodAt, setPeriodAt] = useState(0);
  const period = periods[periodAt] ?? null;
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
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

  if (tickets.length === 0 && periods.length === 0) return null;

  // 이 회차의 행 — 실제 수강 내역 중 기간 안 수업. 지난 회차에 하나도 없으면 가짜 행(목)
  const shown = !period
    ? tickets
    : (() => {
      const real = tickets.filter((tk) => inPeriod(tk, period));
      if (real.length > 0 || period.current) return real;
      return mockTicketsForPeriod(period, tickets[0] ?? null, days);
    })();
  const canLoadMore = hasMore && (!period || period.current);
  // '2026.10.04 ~ 11.03' — 해가 바뀌는 회차면 끝에도 해를 붙인다('2025.12.15 ~ 2026.01.14')
  const periodLabel = period
    ? `${period.startDate} ~ ${period.endDate.slice(0, 4) === period.startDate.slice(0, 4) ? period.endDate.slice(5) : period.endDate}`
    : '';

  return (
    <LessonSection title={t('regular_class_history')}>
      {/* 결제 회차 내비게이션 — < 3회차 · 10.15 ~ 11.14 (현재) > */}
      {period && (
        <div className="mt-2 mb-1 flex items-center justify-between rounded-xl bg-[#F7F8FA] px-1.5 py-1.5 !border-0">
          <button
            type="button"
            aria-label="previous period"
            disabled={periodAt >= periods.length - 1}
            onClick={() => setPeriodAt((i) => Math.min(periods.length - 1, i + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E5968] active:bg-black/5 disabled:text-[#D1D6DB]"
          >
            <ChevronLeft size={18}/>
          </button>
          <span className="flex items-center gap-1.5 min-w-0 text-[13px] tracking-[-0.2px]">
            <span className="font-bold text-[#191F28] font-paperlogy">{t('regular_class_period_nth').replace('{n}', String(period.index))}</span>
            <span className="text-[#8B95A1]">·</span>
            <span className="font-semibold text-[#4E5968] truncate">{periodLabel}</span>
            {period.current && <span className={`${chipBase} bg-[#191F28] text-white`}>{t('regular_class_period_current')}</span>}
          </span>
          <button
            type="button"
            aria-label="next period"
            disabled={periodAt <= 0}
            onClick={() => setPeriodAt((i) => Math.max(0, i - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E5968] active:bg-black/5 disabled:text-[#D1D6DB]"
          >
            <ChevronRight size={18}/>
          </button>
        </div>
      )}
      {shown.length === 0 && (
        <p className="py-8 text-center text-[13.5px] text-[#8B95A1]">{t('regular_class_period_empty')}</p>
      )}
      {shown.map((tk) => {
        const attended = tk.status === 'Used';
        const chipKind = attended ? 'attended' : tk.status === 'Unpaid' ? 'unpaid' : 'other';
        const artist = tk.lesson?.artists?.[0];
        return (
          <LessonRow
            key={tk.id}
            title={tk.lesson?.title ?? ''}
            startDate={tk.lesson?.startDate}
            artistName={artist?.nickName || artist?.name}
            artistImageUrl={artist?.profileImageUrl}
            locale={locale}
            isPast
            // 가짜 행(목, id 음수)은 수강권 상세가 없다
            route={tk.id > 0 ? KloudScreen.TicketDetail(tk.id, false) : undefined}
            chip={
              <span className={`${chipBase} ${chipClass[chipKind]}`}>
                {getLocaleString({ locale, key: attended ? 'attendance_attended' : convertStatusToMessage({ status: tk.status }) })}
              </span>
            }
          />
        );
      })}
      {canLoadMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-6">
          {isLoading && <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>}
        </div>
      )}
    </LessonSection>
  );
};
