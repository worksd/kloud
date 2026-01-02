'use server'
import {api} from "@/app/api.client";
import {RequestDiscountParameter} from "@/app/endpoint/payment.record.endpoint";

export const requestAccountTransferAction = async ({item, itemId, depositor, targetUserId, discounts}: {
  item: string,
  itemId: number,
  depositor: string,
  targetUserId?: number,
  discounts?: RequestDiscountParameter[];
}) => {
  return await api.paymentRecord.requestAccountTransfer({item, itemId, depositor, targetUserId, discounts})
}