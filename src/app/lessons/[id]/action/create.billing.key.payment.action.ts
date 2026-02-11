'use server'
import { api } from "@/app/api.client";

export const createBillingKeyPaymentAction = async ({item, itemId, billingKey, targetUserId}: {
  item: string
  itemId: number,
  billingKey: string
  targetUserId?: number
}) => {
  return await api.payment.createByBillingKey({item, itemId, billingKey, targetUserId})
}
