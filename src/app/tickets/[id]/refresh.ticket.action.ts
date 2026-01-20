'use server';

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function refreshTicketAction({ticketId}: {ticketId: number}): Promise<TicketResponse | GuinnessErrorCase> {
  return await api.ticket.get({id: ticketId, isParent: false});
}
