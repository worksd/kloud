'use server';

import { api } from "@/app/api.client";
import { LessonGroupTicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function refreshLessonGroupTicketAction({ticketId}: {ticketId: number}): Promise<LessonGroupTicketResponse | GuinnessErrorCase> {
  return await api.lessonGroupTicket.get({id: ticketId});
}
