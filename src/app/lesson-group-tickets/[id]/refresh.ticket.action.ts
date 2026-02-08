'use server';

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function refreshLessonGroupTicketAction({ticketId}: {ticketId: number}): Promise<TicketResponse | GuinnessErrorCase> {
  return await api.lessonGroupTicket.get({id: ticketId, isParent: false});
}
