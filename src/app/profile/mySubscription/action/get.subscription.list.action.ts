'use server'
import { api } from "@/app/api.client";

export const getSubscriptionList = async () => {
  return await api.subscription.list({})
}