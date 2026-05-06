'use server'
import { api } from "@/app/api.client";

export const getBillingListAction = async () => {
  return await api.billing.get({})

}