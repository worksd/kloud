import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { redirect } from "next/navigation";

export default async function PaymentRedirectPage({searchParams}:
                                                    {
                                                      searchParams: Promise<{
                                                        type: string,
                                                        paymentId: string,
                                                        id: number,
                                                        message?: string
                                                      }>
                                                    }
) {

  const {type, paymentId, id, message} = await searchParams;

  if (message) {
    return <div>{message}</div>
  } else {
    if (type == 'lesson') {
      const res = await createTicketAction({paymentId: paymentId, lessonId: id, status: 'Paid'});
      const route = 'id' in res ? KloudScreen.TicketDetail(res.id, true) : null
      if (route) redirect(route)

    } else if (type == 'passPlan') {
      const res = await createPassAction({paymentId: paymentId, passPlanId: id, status: 'Active'});
      const route = 'id' in res ? KloudScreen.PassPaymentComplete(res.id) : null
      if (route) redirect(route)
    }
  }

  return (
    <div/>
  )
}