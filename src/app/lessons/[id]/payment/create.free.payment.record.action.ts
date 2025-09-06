'use server'

import { api } from "@/app/api.client";

export const createFreePaymentRecord = async ({item, itemId}: {item: string, itemId: number}) => {
  const res = await api.paymentRecord.createFreePaymentRecord({ item, itemId })
  return res
}