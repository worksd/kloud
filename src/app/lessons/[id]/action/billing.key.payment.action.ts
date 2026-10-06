'use server'
import { api } from "@/app/api.client";
import { PaymentDiscount } from "@/app/endpoint/payment.endpoint";

export const billingKeyPaymentAction = async ({item, itemId, billingKey, paymentId, targetUserId, discounts, startDate, endDate, firstLessonId}: {
  item: string
  itemId: number,
  billingKey: string
  paymentId: string
  targetUserId?: number
  discounts?: PaymentDiscount[]
  startDate?: string
  endDate?: string
  /** 시작 회차 id — 가격정책(pass-plan) 결제에선 서버가 무시한다(시작은 패스 startDate 로만 정함). 보내도 오류는 없음 */
  firstLessonId?: number
}) => {
  return await api.payment.billingKey({item, itemId, billingKey, paymentId, targetUserId, discounts, startDate, endDate, firstLessonId})
}
