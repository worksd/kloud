'use server'
import { api } from "@/app/api.client";

export const getPaymentRecordsAction = async ({ page }: { page?: number }) => {
  return await api.paymentRecord.list({ page })
}
