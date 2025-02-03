'use server'

import { api } from "@/app/api.client";

export const createTicketAction = async ({paymentId, lessonId, status, depositor} : {paymentId: string, lessonId : number, status: string, depositor?: string}) => {
  return await api.ticket.create({
    paymentId, lessonId, status, depositor
  })
}