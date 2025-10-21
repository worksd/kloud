import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { TicketForm } from "@/app/tickets/[id]/TicketForm";
import { QrCodeDialogScreen } from "@/app/tickets/[id]/QrCodeDialog";
import { translate } from "@/utils/translate";

export default async function TicketDetail({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ isJustPaid: string, inviteCode: string }>
}) {
  const {isJustPaid, inviteCode} = await searchParams
  const ticket = inviteCode && inviteCode.length == 10 ?
    await api.ticket.getInviteTicket({inviteCode})
    : await api.ticket.get({id: (await params).id});
  if ('id' in ticket) {
    return <div className={'pt-12'}>
      <TicketForm isJustPaid={isJustPaid} ticket={ticket} inviteCode={inviteCode}/>
      <QrCodeDialogScreen
        qrCodeUrl={ticket.qrCodeUrl}
        ticketId={ticket.id}
        endpoint={process.env.GUINNESS_API_SERVER ?? ''}
        message={await translate('do_not_capture_qr')}
      />
    </div>
  } else {
    return <Loading/>;
  }
}