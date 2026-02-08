import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { getLocale, translate } from "@/utils/translate";
import { LessonGroupTicketListClient } from "@/app/lesson-group-tickets/TicketListClient";

export default async function LessonGroupTicketListPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <LessonGroupTicketListServer/>
    </Suspense>
  );
}

async function LessonGroupTicketListServer() {
  const res = await api.lessonGroupTicket.list({ page: 1 });
  const locale = await getLocale();
  const noTicketsTitle = await translate('no_payment_records_title');
  const noTicketsMessage = await translate('no_payment_records_message');

  const initialTickets = 'lessonGroupTickets' in res ? res.lessonGroupTickets : [];

  return (
    <LessonGroupTicketListClient
      initialTickets={initialTickets}
      locale={locale}
      noTicketsTitle={noTicketsTitle}
      noTicketsMessage={noTicketsMessage}
    />
  );
}
