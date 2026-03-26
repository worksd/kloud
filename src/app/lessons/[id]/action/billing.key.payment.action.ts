'use server'
import { api } from "@/app/api.client";

export const billingKeyPaymentAction = async ({item, itemId, billingKey, targetUserId}: {
  item: string
  itemId: number,
  billingKey: string
  targetUserId?: number
}) => {
  return await api.payment.billingKey({item, itemId, billingKey, targetUserId})
}
