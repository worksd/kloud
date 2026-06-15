'use server'
import { api } from "@/app/api.client";
import { PaymentDiscount } from "@/app/endpoint/payment.endpoint";

export const billingKeyPaymentAction = async ({item, itemId, billingKey, paymentId, targetUserId, discounts, policyId}: {
  item: string
  itemId: number,
  billingKey: string
  paymentId: string
  targetUserId?: number
  discounts?: PaymentDiscount[]
  policyId?: number
}) => {
  return await api.payment.billingKey({item, itemId, billingKey, paymentId, targetUserId, discounts, policyId})
}
