'use server'

import { api } from "@/app/api.client";
import { MyTicketListResponse } from "@/app/endpoint/ticket.endpoint";

// 이 정규반 수강 내역 — GET /regular-classes/:id/tickets?type=past (시작한 회차 최근 순, 20개/page).
// 실패는 null — 화면은 pass 의 지난 수업으로 폴백한다.
export const getRegularClassTicketsAction = async ({ id, page }: { id: number; page: number }): Promise<MyTicketListResponse | null> => {
  try {
    const res = await api.ticket.listByRegularClass({ id, type: 'past', page });
    return 'tickets' in res ? res : null;
  } catch {
    return null;
  }
};
