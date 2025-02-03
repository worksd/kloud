'use server'

import { api } from "@/app/api.client";

export const createTicketAction = async ({paymentId, lessonId, status} : {paymentId: string, lessonId : number, status: string}) => {
  return await api.ticket.create({
    paymentId, lessonId, status
  })
}