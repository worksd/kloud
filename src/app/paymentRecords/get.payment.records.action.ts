'use server'
import { api } from "@/app/api.client";

export const getPaymentRecordsAction = async ({ page, date }: { page?: number; date?: string }) => {
  return await api.paymentRecord.list({ page, date })
}
