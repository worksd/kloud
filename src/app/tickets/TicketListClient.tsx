'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { getTicketsAction } from "@/app/tickets/get.tickets.action";
import { Locale } from "@/shared/StringResource";

type Props = {
  initialTickets: TicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
};

export const TicketListClient = ({ initialTickets, locale, noTicketsTitle, noTicketsMessage }: Props) => {
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

  if (tickets.length === 0) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
          <h2 className="text-[20px] font-bold text-black mb-2">
            {noTicketsTitle}
          </h2>
          <p className="text-[16px] text-[#86898C] text-center mb-8">
            {noTicketsMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
      <div className="flex flex-col">
        {tickets.map((item) => (
          <div className="flex flex-col" key={item.id}>
            <TicketItem item={item} locale={locale} />
            <div className="w-full h-[2px] bg-[#F7F8F9]" />
          </div>
        ))}
      </div>

      {/* 무한스크롤 트리거 */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
};
