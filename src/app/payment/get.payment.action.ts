'use server'

import { api } from "@/app/api.client";

export const getPaymentAction = async ({
  type,
  id,
  targetUserId
}: {
  type: 'lesson' | 'pass-plan' | 'lesson-group'
  id: number
  targetUserId?: number
}) => {
  return await api.payment.get({ item: type, itemId: id, targetUserId })
}
