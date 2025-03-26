import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { redirect } from "next/navigation";
import { extractNumber } from "@/utils";

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

  const {paymentId, message} = await searchParams;
  const type = paymentId.split('-')[0]
  const id = paymentId.split('-')[1]
  if (message) {
    return <div>{message}</div>
  } else {
    if (type == 'LT') {
      const res = await createTicketAction({paymentId: paymentId, lessonId: extractNumber(id), status: 'Paid'});
      const route = 'id' in res ? KloudScreen.TicketDetail(res.id, true) : null
      if (route) redirect(route)
    } else if (type == 'LP') {
      const res = await createPassAction({paymentId: paymentId, passPlanId: extractNumber(id), status: 'Active'});
      const route = 'id' in res ? KloudScreen.PassPaymentComplete(res.id) : null
      if (route) redirect(route)
    }
  }

  return (
    <div/>
  )
}