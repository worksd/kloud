'use client';
// 내 정규반 상세 — 수강 내역. GET /regular-classes/:id/tickets?type=past 로 이 반에서 들은 회차를 최근 순으로.
// 지금 패스뿐 아니라 지난 기간 패스·단건 결제 회차까지 담긴다(취소 제외). 첫 페이지는 서버가 실어 주고, 바닥에 닿으면 다음 페이지.
// 행 = 공용 LessonRow + 메인 강사(artists[0]) 닉네임(없으면 이름). 탭하면 수강권 상세.
// 결제 단위(paymentId)로 묶어서 본다 — 제목 아래 '< 3회차 · 2026.10.04 ~ 11.03 [현재] >' 로 결제 회차를 넘긴다. 한 결제(LP…)에 딸린 수강권들이 한 회차.
// 회차 번호는 가장 오래된 결제가 1회차 — 번호가 밀리지 않게 마운트 직후 남은 페이지를 끝까지 다 불러온다(서버 목록이 최근 순 20개 단위라).
// 출석완료 행은 칩 아래 출석 날짜·시각.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { ticketStatusLabelKey, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { chipBase, chipClass, formatAttendedAt, Kind, LessonRow, LessonSection, parts } from "@/app/profile/myRegularClass/[id]/regular.class.lesson.row";
import { getRegularClassTicketsAction } from "@/app/profile/myRegularClass/[id]/get.regular.class.tickets.action";
import { withYearNumeric } from "@/utils/year.label";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** 결제 한 건에 딸린 수강권 묶음 — 수강 내역의 '회차' */
type PaymentGroup = { key: string; paymentId: string | null; tickets: TicketResponse[]; from: number; to: number };

const NO_PAYMENT = '__none__';

// paymentId 로 묶고 수업 날짜가 늦은 결제부터. 결제번호 없는 옛 수강권은 하나로 묶는다
const groupByPayment = (tickets: TicketResponse[]): PaymentGroup[] => {
  const map = new Map<string, PaymentGroup>();
  for (const tk of tickets) {
    const key = tk.paymentId ?? NO_PAYMENT;
    const at = parts(tk.lesson?.startDate)?.at ?? 0;
    const g = map.get(key);
    if (g) { g.tickets.push(tk); g.from = Math.min(g.from, at || g.from); g.to = Math.max(g.to, at); }
    else map.set(key, { key, paymentId: tk.paymentId ?? null, tickets: [tk], from: at, to: at });
  }
  return [...map.values()].sort((a, b) => b.to - a.to);
};

// '2026.10.04 ~ 11.03' — 해가 바뀌면 끝에도 해('2025.12.15 ~ 2026.01.14'), 하루면 한 날짜만
const rangeLabel = (g: PaymentGroup): string => {
  const d = (ms: number) => new Date(ms + 9 * 3600000); // KST 벽시계
  const f = d(g.from), t = d(g.to);
  const fy = f.getUTCFullYear(), ty = t.getUTCFullYear();
  const md = (x: Date) => `${x.getUTCMonth() + 1}.${x.getUTCDate()}`;
  const start = `${fy}.${md(f)}`;
  if (g.from === g.to || !g.from) return withYearNumeric(md(t), ty);
  return `${start} ~ ${fy === ty ? md(t) : `${ty}.${md(t)}`}`;
};

export const RegularClassHistory = ({ regularClassId, initialTickets, totalPage: initialTotalPage, currentPaymentId, locale }: {
  regularClassId: number;
  initialTickets: TicketResponse[];
  totalPage: number;
  /** 지금 보고 있는 패스의 결제번호 — 그 회차에 '현재' 칩 */
  currentPaymentId?: string | null;
  locale: Locale;
}) => {
  const [tickets, setTickets] = useState(initialTickets);
  // 보고 있는 회차 — groups 인덱스(0 = 최신)
  const [groupAt, setGroupAt] = useState(0);
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

  const groups = groupByPayment(tickets);
  const group = groups[Math.min(groupAt, Math.max(groups.length - 1, 0))] ?? null;
  const atOldest = groupAt >= groups.length - 1;

  // 남은 페이지를 끝까지 — 회차 번호(가장 오래된 결제 = 1회차)가 페이지를 넘길 때마다 바뀌지 않게
  useEffect(() => {
    if (hasMore && !isLoading) loadMore();
  }, [hasMore, isLoading, loadMore]);
  const ordinal = (i: number) => groups.length - i; // 0 = 최신 = N회차

  if (tickets.length === 0) return null;
  const shown = group?.tickets ?? [];

  return (
    <LessonSection title={t('regular_class_history')}>
      {/* 결제 회차 내비게이션 — < 2026.10.04 ~ 11.03 (현재) > */}
      {group && (
        <div className="mt-2 mb-1 flex items-center justify-between rounded-xl bg-[#F7F8FA] px-1.5 py-1.5 !border-0">
          <button
            type="button"
            aria-label="previous payment"
            disabled={atOldest && !hasMore}
            onClick={() => setGroupAt((i) => Math.min(groups.length - 1, i + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E5968] active:bg-black/5 disabled:text-[#D1D6DB]"
          >
            <ChevronLeft size={18}/>
          </button>
          <span className="flex items-center gap-1.5 min-w-0 text-[13px] tracking-[-0.2px]">
            <span className="font-bold text-[#191F28] font-paperlogy shrink-0">{t('regular_class_period_nth').replace('{n}', String(ordinal(groupAt)))}</span>
            <span className="text-[#8B95A1]">·</span>
            <span className="font-semibold text-[#4E5968] truncate">{rangeLabel(group)}</span>
            {currentPaymentId && group.paymentId === currentPaymentId && (
              <span className={`${chipBase} bg-[#191F28] text-white`}>{t('regular_class_period_current')}</span>
            )}
          </span>
          <button
            type="button"
            aria-label="next payment"
            disabled={groupAt <= 0}
            onClick={() => setGroupAt((i) => Math.max(0, i - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4E5968] active:bg-black/5 disabled:text-[#D1D6DB]"
          >
            <ChevronRight size={18}/>
          </button>
        </div>
      )}
      {shown.map((tk) => {
        // 지난 수업 — 출석완료 / 미납 / 불참(지났는데 사용 기록 없음) / 취소
        const labelKey = ticketStatusLabelKey(tk);
        const chipKind: Kind = labelKey === 'ticket_status_used' ? 'attended'
          : labelKey === 'pass_status_unpaid' ? 'unpaid'
          : labelKey === 'attendance_absent' ? 'absent'
          : labelKey === 'purchase_cancel' ? 'cancelled'
          : 'other';
        const artist = tk.lesson?.artists?.[0];
        // 출석완료면 칩 아래에 출석 날짜·시각을 작게
        const attendedTime = chipKind === 'attended' ? formatAttendedAt(tk.attendedAt) : null;
        return (
          <LessonRow
            key={tk.id}
            title={tk.lesson?.title ?? ''}
            startDate={tk.lesson?.startDate}
            artistName={artist?.nickName || artist?.name}
            artistImageUrl={artist?.profileImageUrl}
            chipSub={attendedTime}
            locale={locale}
            isPast
            route={KloudScreen.TicketDetail(tk.id, false)}
            chip={
              <span className={`${chipBase} ${chipClass[chipKind]}`}>
                {getLocaleString({ locale, key: labelKey })}
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
