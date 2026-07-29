'use server'

import { api } from "@/app/api.client";

export const getPaymentAction = async ({
  item,
  id,
  targetUserId,
  date,
  startTime,
  endTime,
}: {
  item: string
  id: number
  targetUserId?: number
  date?: string
  startTime?: string
  endTime?: string
}) => {
  return await api.payment.get({ item, itemId: id, targetUserId, date, startTime, endTime })
}
