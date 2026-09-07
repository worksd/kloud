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
                                                        lessonId?: string,
                                                        code?: string,
                                                        message?: string
                                                      }>
                                                    }
) {

  const {paymentId, lessonId, code, message} = await searchParams;
  const Message = ({ text }: { text: string }) => (
    <div className="w-full min-h-screen flex items-center justify-center px-6 text-center bg-white">
      <p className="text-[16px] text-[#4E5968] whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
  // 실패/취소 — PortOne이 code(또는 message)를 반환. 결제기록 조회 없이 안내만.
  if (code || message) {
    return <Message text={message || '결제가 취소되었거나 실패했어요.'} />
  }
  if (!paymentId) {
    return <Message text="결제 정보를 확인할 수 없습니다." />
  }
  await new Promise(resolve => setTimeout(resolve, 4000)); // 이 코드 없으면 갱신안됨 (서버 반영 대기)
  const res = await getPaymentRecordDetail({paymentId: paymentId});
  // 결제수단과 무관하게 영수증 대신 환영 화면(결제완료)으로 — lessonId는 있으면 감성 섹션용
  const route = 'paymentId' in res
    ? KloudScreen.PaymentComplete(paymentId, lessonId && /^\d+$/.test(lessonId) ? Number(lessonId) : undefined)
    : null
  if (route) redirect(route)
  return <Message text={`잘못된 결제 ID입니다. (ID: ${paymentId})`} />
}