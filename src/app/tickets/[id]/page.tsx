import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { TicketForm } from "@/app/tickets/[id]/TicketForm";
import { QrCodeDialogScreen } from "@/app/tickets/[id]/QrCodeDialog";

export default async function TicketDetail({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ isJustPaid: string }>
}) {
  const ticket = await api.ticket.get({id: (await params).id});
  if ('id' in ticket) {
    return <div>
      <TicketForm isJustPaid={(await searchParams).isJustPaid} ticket={ticket}/>
      <QrCodeDialogScreen qrCodeUrl={ticket.qrCodeUrl}/>
    </div>
  } else {
    return <Loading/>;
  }
}

