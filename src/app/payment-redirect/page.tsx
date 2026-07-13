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
                                                        code?: string,
                                                        message?: string
                                                      }>
                                                    }
) {

  const {paymentId, code, message} = await searchParams;
  // 실패/취소 — PortOne이 code(또는 message)를 반환. 결제기록 조회 없이 안내만.
  if (code || message) {
    return <div>{message ?? '결제가 취소되었거나 실패했어요.'}</div>
  }
  if (!paymentId) {
    return <div>결제 정보를 확인할 수 없습니다.</div>
  }
  await new Promise(resolve => setTimeout(resolve, 2000)); // 이 코드 없으면 갱신안됨
  const res = await getPaymentRecordDetail({paymentId: paymentId});
  const route = 'paymentId' in res ? KloudScreen.PaymentRecordDetail(paymentId) : null
  if (route) redirect(route)
  return <div>잘못된 결제ID입니다 ID: {paymentId}</div>
}