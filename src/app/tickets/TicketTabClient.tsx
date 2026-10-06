'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { getTicketsAction } from "@/app/tickets/get.tickets.action";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

type Props = {
  initialTickets: TicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
};

export const TicketTabClient = ({
  initialTickets,
  locale,
  noTicketsTitle,
  noTicketsMessage,
}: Props) => {
  const handleBack = () => {
    (window as any).KloudEvent?.back();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col box-border">
      {/* Header: Back Arrow + Title */}
      <div className="flex flex-row items-center gap-3 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={handleBack} className="flex items-center justify-start flex-shrink-0 -ml-1 p-1">
          <BackArrowIcon className="w-6 h-6 text-[#191F28]"/>
        </button>
        <span className="text-[20px] text-[#191F28] font-bold tracking-[-0.4px]">
          {getLocaleString({ locale, key: 'my_tickets' })}
        </span>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-auto">
        <TicketListContent
          initialTickets={initialTickets}
          locale={locale}
          noTicketsTitle={noTicketsTitle}
          noTicketsMessage={noTicketsMessage}
        />
      </div>
    </div>
  );
};

// 'yyyy-MM-dd HH:mm' 또는 'yyyy.MM.dd HH:mm' → epoch ms. 파싱 실패면 null(지난 수업으로 분류)
const parseLessonStart = (startDate?: string): number | null => {
  if (!startDate) return null;
  const t = new Date(startDate.replace(/\./g, '-').replace(' ', 'T')).getTime();
  return Number.isNaN(t) ? null : t;
};

// 섹션 헤더 + 행 리스트(얇은 구분선)
const TicketSection = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <section className="pb-2">
    <div className="flex items-baseline gap-2 px-5 pt-5 pb-1">
      <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{title}</h2>
      <span className="text-[13px] font-semibold text-[#B0B8C1] font-paperlogy">{count}</span>
    </div>
    <div className="flex flex-col divide-y divide-[#F2F4F6]">{children}</div>
  </section>
);

// PC 웹(프로필 셸)에서도 재사용 — 리스트/무한스크롤/빈 상태만 담당
export const TicketListContent = ({
  initialTickets,
  locale,
  noTicketsTitle,
  noTicketsMessage,
}: {
  initialTickets: TicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
}) => {
  const [tickets, setTickets] = useState<TicketResponse[]>(initialTickets);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTickets.length > 0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getTicketsAction({ page: nextPage });

    if ('tickets' in res && res.tickets.length > 0) {
      setTickets(prev => [...prev, ...res.tickets]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  const now = Date.now();
  const startOf = (t: TicketResponse) => parseLessonStart(t.lesson?.startDate);
  const upcoming = tickets
    .filter((t) => { const s = startOf(t); return s != null && s > now; })
    .sort((a, b) => (startOf(a) ?? 0) - (startOf(b) ?? 0));
  const past = tickets
    .filter((t) => { const s = startOf(t); return s == null || s <= now; })
    .sort((a, b) => (startOf(b) ?? 0) - (startOf(a) ?? 0));

  if (tickets.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-[18px] font-bold text-[#191F28] mb-1.5 tracking-[-0.3px]">
          {noTicketsTitle}
        </h2>
        <p className="text-[14px] text-[#8B95A1] text-center mb-8">
          {noTicketsMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 현재 기준 수업 시작 시각으로 다가오는 수업 / 지난 수업 분리. 다가오는 건 가까운 순, 지난 건 최근 순.
          무한스크롤로 페이지가 붙으면 각 그룹에 재분류된다. */}
      {upcoming.length > 0 && (
        <TicketSection title={getLocaleString({ locale, key: 'upcoming_lessons' })} count={upcoming.length}>
          {upcoming.map((item) => <TicketItem key={item.id} item={item} locale={locale} />)}
        </TicketSection>
      )}
      {past.length > 0 && (
        <TicketSection title={getLocaleString({ locale, key: 'past_lessons' })} count={past.length}>
          {past.map((item) => <TicketItem key={item.id} item={item} locale={locale} />)}
        </TicketSection>
      )}

      <div ref={loadMoreRef} className="flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin p-4" />
        )}
      </div>
    </>
  );
};
