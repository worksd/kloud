'use server'
import { api } from "@/app/api.client";

// 회차 미루기 — 아직 시작하지 않은 회차를 다음 회차로 옮긴다.
// 미룰 수 있는 횟수/시점 제약은 전부 서버가 판정하고, 위반은 LESSON_POSTPONE_* 코드로 내려온다.
export const postponeTicketAction = async ({ticketId}: {ticketId: number}) => {
  return await api.ticket.postpone({id: ticketId})
}
