'use server';

import { api } from "@/app/api.client";

/**
 * 관리자(수업 상세)가 수강생 출석 처리.
 * POST /tickets/:id/use — 키오스크 수업 출석과 같은 API. lessonId를 함께 보내 어느 수업 출석인지 명시.
 */
export async function markTicketUsedAction(ticketId: number, lessonId?: number) {
  return await api.ticket.toUsed({ id: ticketId, lessonId });
}
