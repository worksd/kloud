'use server';

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function useAction({
  ticketId,
  expiredAt,
  lessonId
}: {
  ticketId: number;
  expiredAt?: string;
  lessonId?: number;
}): Promise<TicketResponse | GuinnessErrorCase> {
  return await api.ticket.toUsed({
    id: ticketId,
    expiredAt,
    lessonId
  });
}
