'use server';

import { api } from '@/app/api.client';
import { TicketResponse } from '@/app/endpoint/ticket.endpoint';

export async function getLessonTicketsAction(lessonId: number): Promise<TicketResponse[]> {
  try {
    const response = await api.lesson.getTickets({ id: lessonId });
    if ('tickets' in response) {
      return response.tickets ?? [];
    }
    return [];
  } catch {
    return [];
  }
}
