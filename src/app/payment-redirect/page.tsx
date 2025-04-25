import { KloudScreen } from "@/shared/kloud.screen";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { redirect } from "next/navigation";
import { extractNumber } from "@/utils";
import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";

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
      const res = await getPaymentRecordDetail({paymentId: paymentId});
      const route = 'id' in res ? KloudScreen.TicketDetail(res.ticket?.id ?? 0, true) : null
      if (route) redirect(route)
    } else if (type == 'LP') {
      const res = await getPaymentRecordDetail({paymentId: paymentId});
      const route = 'id' in res ? KloudScreen.PassPaymentComplete(res.pass?.id ?? 0) : null
      if (route) redirect(route)
    }
    return <div>잘못된 결제ID입니다 ID: {paymentId}</div>
  }

  return (
    <div/>
  )
}