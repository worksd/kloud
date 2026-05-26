'use server'

import { api } from "@/app/api.client";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";

export const addBillingAction = async (req: CreateBillingRequest) => {
  return await api.billing.create(req)
}