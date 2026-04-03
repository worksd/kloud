'use server'
import { api } from "@/app/api.client";

export const billingKeyPaymentAction = async ({item, itemId, billingKey, paymentId, targetUserId}: {
  item: string
  itemId: number,
  billingKey: string
  paymentId: string
  targetUserId?: number
}) => {
  return await api.payment.billingKey({item, itemId, billingKey, paymentId, targetUserId})
}
