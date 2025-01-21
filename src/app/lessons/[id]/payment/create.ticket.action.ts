'use server'

import { api } from "@/app/api.client";

export const createTicketAction = async ({paymentId, lessonId} : {paymentId: string, lessonId : number}) => {
  return await api.ticket.create({
    paymentId, lessonId,
  })
}