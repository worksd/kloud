'use server'

import { api } from "@/app/api.client";

export const getLessonGroupPaymentAction = async ({id, targetUserId}: { id: number, targetUserId?: number}) => {
  return await api.payment.get({item: 'lesson-group', itemId: id, targetUserId})
}
