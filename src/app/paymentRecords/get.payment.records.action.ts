'use server'
import { api } from "@/app/api.client";

export const getPaymentRecordsAction = async ({}) => {
  return await api.paymentRecord.list({})
}