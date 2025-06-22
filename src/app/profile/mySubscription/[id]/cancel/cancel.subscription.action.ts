'use server'
import { api } from "@/app/api.client";

export const cancelSubscriptionAction = async ({subscriptionId, reason}: {subscriptionId: string, reason: string}) => {
  return await api.subscription.cancel({
    subscriptionId,
    reason,
    requester: 'CUSTOMER'
  })
}
