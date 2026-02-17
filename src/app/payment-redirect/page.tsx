import { KloudScreen } from "@/shared/kloud.screen";
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
  if (message) {
    return <div>{message}</div>
  } else {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 이 코드 없으면 갱신안됨
    const res = await getPaymentRecordDetail({paymentId: paymentId});
    const route = 'paymentId' in res ? KloudScreen.PaymentRecordDetail(paymentId) : null
    if (route) redirect(route)
    return <div>잘못된 결제ID입니다 ID: {paymentId}</div>
  }
}