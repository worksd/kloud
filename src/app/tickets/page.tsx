import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { getLocale, translate } from "@/utils/translate";
import { TicketTabClient } from "@/app/tickets/TicketTabClient";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";

export default async function TicketListPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <TicketListServer/>
    </Suspense>
  );
}

async function TicketListServer() {
  const [ticketRes, lessonGroupRes] = await Promise.all([
    api.ticket.list({ page: 1 }),
    api.lessonGroupTicket.list({ page: 1 }),
  ]);

  if (!('tickets' in ticketRes)) {
    const result = await handleApiError(ticketRes, 'GET /tickets');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }

  const locale = await getLocale();
  const noTicketsTitle = await translate('no_payment_records_title');
  const noTicketsMessage = await translate('no_payment_records_message');

  const initialTickets = 'tickets' in ticketRes ? ticketRes.tickets : [];
  const initialLessonGroupTickets = 'lessonGroupTickets' in lessonGroupRes ? lessonGroupRes.lessonGroupTickets : [];

  return (
    <TicketTabClient
      initialTickets={initialTickets}
      initialLessonGroupTickets={initialLessonGroupTickets}
      locale={locale}
      noTicketsTitle={noTicketsTitle}
      noTicketsMessage={noTicketsMessage}
    />
  );
}
