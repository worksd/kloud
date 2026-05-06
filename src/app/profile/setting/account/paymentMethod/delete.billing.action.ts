'use server'
import { api } from "@/app/api.client";

export const deleteBillingAction = async ({billingKey} : {billingKey: string}) => {
  return await api.billing.delete({billingKey})
}