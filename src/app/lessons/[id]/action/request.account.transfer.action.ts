'use server'
import { api } from "@/app/api.client";

export const requestAccountTransferAction = async ({item, itemId, depositor}: {
  item: string,
  itemId: number,
  depositor: string
}) => {
  const res = await api.paymentRecord.requestAccountTransfer({item, itemId, depositor})
  return res
}