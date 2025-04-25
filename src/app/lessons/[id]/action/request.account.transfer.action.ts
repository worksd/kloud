'use server'
import { api } from "@/app/api.client";

export const requestAccountTransferAction = async ({paymentId, depositor}: {
  paymentId: string,
  depositor: string
}) => {
  const res = await api.paymentRecord.requestAccountTransfer({paymentId, depositor})
  return res
}