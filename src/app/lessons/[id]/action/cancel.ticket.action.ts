'use server';

import { api } from "@/app/api.client";

/**
 * 관리자(artist/partner)가 학생 수강권 취소.
 * DELETE /tickets/:id — requester='ADMIN', reason 필수.
 * 환불 정책은 JWT의 user.studioId 기준으로 자동 분기 (partner면 자유 환불).
 */
export async function cancelTicketAction(ticketId: number) {
  return await api.ticket.delete({
    ticketId,
    reason: '관리자 취소',
    requester: 'ADMIN',
  });
}
