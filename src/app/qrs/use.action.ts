'use server';

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { revalidateTag } from "next/cache";

export async function useAction({
  ticketId,
  expiredAt,
  lessonId
}: {
  ticketId: number;
  expiredAt?: string;
  lessonId?: number;
}): Promise<TicketResponse | GuinnessErrorCase> {
  const res = await api.ticket.toUsed({
    id: ticketId,
    expiredAt,
    lessonId
  });
  if ('id' in res) {
    // @ts-ignore - Next.js 16 type definition issue
    if (lessonId) revalidateTag(`lesson:${lessonId}`);
    // @ts-ignore - Next.js 16 type definition issue
    else revalidateTag('lesson');
  }
  return res;
}
