import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { TicketForm } from "@/app/tickets/[id]/TicketForm";

export default async function TicketDetail({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ isJustPaid: string }>
}) {
  const ticket = await api.ticket.get({id: (await params).id});
  if ('id' in ticket) {
    return <TicketForm isJustPaid={(await searchParams).isJustPaid} ticket={ticket}/>
  } else {
    return <Loading/>;
  }
}

