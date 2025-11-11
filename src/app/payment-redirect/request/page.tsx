import { KloudScreen } from "@/shared/kloud.screen";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { redirect } from "next/navigation";
import { extractNumber } from "@/utils";
import { getPaymentRecordDetail } from "@/app/lessons/[id]/action/get.payment.record.detail";
import { checkVerificationCodeAction } from "@/app/login/phone/check.verification.code.action";

export default async function PaymentRedirectRequestPage({searchParams}:
                                                  {
                                                    searchParams: Promise<{
                                                      phone: string,
                                                      countryCode: string,
                                                      item: 'lesson' | 'pass-plan',
                                                      itemId: number,
                                                    }>
                                                  }
) {

  const {phone, countryCode, item, itemId } = await searchParams;
  const res = await checkVerificationCodeAction({
    phone,
    countryCode,
    isAdmin: true,
    code: "000000" // 하드코딩해도 괜찮음 어차피 검사 안하므로
  })
  if ('user' in res) {
    if (item == 'lesson') {
      redirect(KloudScreen.LessonPayment(itemId))
    } else if (item == 'pass-plan') {
      redirect(KloudScreen.PassPayment(itemId))
    }
  }
}