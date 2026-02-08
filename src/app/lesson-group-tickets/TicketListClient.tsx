'use client';

import { LessonGroupTicketResponse } from "@/app/endpoint/ticket.endpoint";
import { LessonGroupTicketItem } from "@/app/lesson-group-tickets/ticket.item";
import { Locale } from "@/shared/StringResource";

type Props = {
  initialTickets: LessonGroupTicketResponse[];
  locale: Locale;
  noTicketsTitle: string;
  noTicketsMessage: string;
};

export const LessonGroupTicketListClient = ({ initialTickets, locale, noTicketsTitle, noTicketsMessage }: Props) => {
  if (initialTickets.length === 0) {
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
      <div className="flex flex-col mb-8">
        {initialTickets.map((item) => (
          <div className="flex flex-col" key={item.id}>
            <LessonGroupTicketItem item={item} locale={locale} />
            <div className="w-full h-[2px] bg-[#F7F8F9]" />
          </div>
        ))}
      </div>
    </div>
  );
};
