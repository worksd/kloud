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
  /** 정기수업 시작 회차 id — item='lesson-group'일 때만 서버가 읽는다 */
  firstLessonId?: number
}) => {
  return await api.payment.billingKey({item, itemId, billingKey, paymentId, targetUserId, discounts, startDate, endDate, firstLessonId})
}
