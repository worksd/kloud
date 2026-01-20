import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { TicketForm } from "@/app/tickets/[id]/TicketForm";
import { QrCodeDialogScreen } from "@/app/tickets/[id]/QrCodeDialog";
import { translate, getLocale } from "@/utils/translate";

export default async function TicketDetail({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ isJustPaid: string, inviteCode: string, isParent: boolean }>
}) {
  const {isJustPaid, inviteCode, isParent} = await searchParams
  const ticket = inviteCode && inviteCode.length == 10 ?
    await api.ticket.getInviteTicket({inviteCode})
    : await api.ticket.get({id: (await params).id, isParent});
  if ('id' in ticket) {
    const locale = await getLocale();
    const studioId = ticket.lesson?.studio?.id ?? ticket.studio?.id;
    const guidelinesResponse = studioId ? await api.guideline.list({studioId}) : null;
    const guidelines = guidelinesResponse && 'guidelines' in guidelinesResponse ? guidelinesResponse.guidelines : [];
    return <div>
      <TicketForm isJustPaid={isJustPaid} ticket={ticket} inviteCode={inviteCode} locale={locale} guidelines={guidelines} endpoint={process.env.GUINNESS_API_SERVER ?? ''}/>
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