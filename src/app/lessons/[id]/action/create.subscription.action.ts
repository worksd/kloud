'use server'
import { api } from "@/app/api.client";

export const createSubscriptionAction = async ({item, itemId, billingKey}: {
  item: string
  itemId: number,
  billingKey: string
}) => {
  return await api.subscription.create({item, itemId, billingKey})
}