'use server'

import { api } from "@/app/api.client";

export const getPaymentAction = async ({
  item,
  id,
  targetUserId,
  date,
}: {
  item: string
  id: number
  targetUserId?: number
  date?: string
}) => {
  return await api.payment.get({ item, itemId: id, targetUserId, date })
}
