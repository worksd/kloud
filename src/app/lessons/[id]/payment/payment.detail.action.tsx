'use server'

import { api } from "@/app/api.client";

export const getLessonPaymentAction = async ({id, targetUserId}: { id: number, targetUserId?: number}) => {
  return await api.payment.get({item: 'lesson', itemId: id, targetUserId})
}