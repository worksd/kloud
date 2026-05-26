'use server'

import { api } from "@/app/api.client";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

export const getLessonTicketsAction = async (lessonId: number): Promise<TicketResponse[]> => {
  try {
    const res = await api.lesson.getTickets({ id: lessonId, order: 'RankAsc' });
    if ('tickets' in res) return res.tickets ?? [];
    return [];
  } catch {
    return [];
  }
};
