import { Suspense } from "react";
import Loading from "@/app/loading";
import { api } from "@/app/api.client";
import { getLocale, translate } from "@/utils/translate";
import { TicketListClient } from "@/app/tickets/TicketListClient";

export default async function TicketListPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <TicketListServer/>
    </Suspense>
  );
}

async function TicketListServer() {
  const res = await api.ticket.list({ page: 1 });
  const locale = await getLocale();
  const noTicketsTitle = await translate('no_payment_records_title');
  const noTicketsMessage = await translate('no_payment_records_message');

  const initialTickets = 'tickets' in res ? res.tickets : [];

  return (
    <TicketListClient
      initialTickets={initialTickets}
      locale={locale}
      noTicketsTitle={noTicketsTitle}
      noTicketsMessage={noTicketsMessage}
    />
  );
}
