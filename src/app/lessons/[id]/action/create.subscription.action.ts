'use server'
import { PaymentItemType } from "@/app/endpoint/payment.endpoint";
import { api } from "@/app/api.client";

export const createSubscriptionAction = async ({item, itemId, billingKey}: {
  item: PaymentItemType,
  itemId: number,
  billingKey: string
}) => {
  return await api.subscription.create({item, itemId, billingKey})
}