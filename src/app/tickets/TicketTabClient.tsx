'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { TicketResponse, LessonGroupTicketResponse } from "@/app/endpoint/ticket.endpoint";
import { TicketItem } from "@/app/tickets/ticket.item";
import { LessonGroupTicketItem } from "@/app/lesson-group-tickets/ticket.item";
import { getTicketsAction } from "@/app/tickets/get.tickets.action";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

type Props = {
  initialTickets: TicketResponse[];
  initialLessonGroupTickets: LessonGroupTicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
};

export const TicketTabClient = ({
  initialTickets,
  initialLessonGroupTickets,
  locale,
  noTicketsTitle,
  noTicketsMessage,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'lessonGroup'>('tickets');

  const handleBack = () => {
    (window as any).KloudEvent?.back();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col box-border">
      {/* Header: Back Arrow + Tabs */}
      <div className="flex flex-row items-center gap-4 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={handleBack} className="flex items-center justify-start flex-shrink-0">
          <BackArrowIcon className="w-6 h-6 text-black"/>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`transition-all duration-300 ${
            activeTab === 'tickets'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({ locale, key: 'my_tickets' })}
        </button>
        <button
          onClick={() => setActiveTab('lessonGroup')}
          className={`transition-all duration-300 ${
            activeTab === 'lessonGroup'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({ locale, key: 'my_lesson_group_tickets' })}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'tickets' ? (
          <TicketListContent
            initialTickets={initialTickets}
            locale={locale}
            noTicketsTitle={noTicketsTitle}
            noTicketsMessage={noTicketsMessage}
          />
        ) : (
          <LessonGroupTicketListContent
            initialTickets={initialLessonGroupTickets}
            locale={locale}
            noTicketsTitle={noTicketsTitle}
            noTicketsMessage={noTicketsMessage}
          />
        )}
      </div>
    </div>
  );
};

const TicketListContent = ({
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

  if (tickets.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-[20px] font-bold text-black mb-2">
          {noTicketsTitle}
        </h2>
        <p className="text-[16px] text-[#86898C] text-center mb-8">
          {noTicketsMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col pb-4">
        {tickets.map((item) => (
          <TicketItem key={item.id} item={item} locale={locale} />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin p-4" />
        )}
      </div>
    </>
  );
};

const LessonGroupTicketListContent = ({
  initialTickets,
  locale,
  noTicketsTitle,
  noTicketsMessage,
}: {
  initialTickets: LessonGroupTicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
}) => {
  if (initialTickets.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-[20px] font-bold text-black mb-2">
          {noTicketsTitle}
        </h2>
        <p className="text-[16px] text-[#86898C] text-center mb-8">
          {noTicketsMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-8">
      {initialTickets.map((item) => (
        <div className="flex flex-col" key={item.id}>
          <LessonGroupTicketItem item={item} locale={locale} />
          <div className="w-full h-[2px] bg-[#F7F8F9]" />
        </div>
      ))}
    </div>
  );
};
