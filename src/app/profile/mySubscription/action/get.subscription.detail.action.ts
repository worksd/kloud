'use server'
import { api } from "@/app/api.client";

export const getSubscriptionDetailAction = async ({subscriptionId}: {subscriptionId: string}) => {
  return await api.subscription.get({ subscriptionId })
}