'use server'
import { api } from "@/app/api.client";

export const deleteLessonGroupTicketAction = async ({ticketId}: {ticketId: number}) => {
  return await api.lessonGroupTicket.delete({ticketId, reason: '수강생 요청에 의한 취소', requester: 'CUSTOMER'})
}
