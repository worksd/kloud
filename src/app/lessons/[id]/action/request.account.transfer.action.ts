'use server'
import {api} from "@/app/api.client";

export const requestAccountTransferAction = async ({item, itemId, depositor, targetUserId,}: {
  item: string,
  itemId: number,
  depositor: string,
  targetUserId?: number,
}) => {
  return await api.paymentRecord.requestAccountTransfer({item, itemId, depositor, targetUserId})
}