'use server'
import { api } from "@/app/api.client";
import { PaymentItemType } from "@/app/endpoint/payment.endpoint";

export const requestAccountTransferAction = async ({item, itemId, depositor}: {
  item: PaymentItemType,
  itemId: number,
  depositor: string
}) => {
  const res = await api.paymentRecord.requestAccountTransfer({item, itemId, depositor})
  return res
}