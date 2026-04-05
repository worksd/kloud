'use server'

import { api } from "@/app/api.client";

export const getPaymentAction = async ({
  item,
  id,
  targetUserId
}: {
  item: string
  id: number
  targetUserId?: number
}) => {
  return await api.payment.get({ item, itemId: id, targetUserId })
}
