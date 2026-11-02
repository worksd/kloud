'use server'
// 내 정규반 상세 — 수업 일정 변경(서버 용어: 회차 미루기). 연동 가이드 2026-11-02 기준.
//  - GET  /regular-classes/:id/tickets?type=upcoming — 시작 전 수강권 + 수강권마다 pass(한도·쓴 횟수)
//  - POST /regular-classes/:id/postpone { ticketId } — 미루기. 응답에 결과가 없어 성공 후 화면을 다시 받는다
//  - GET  /regular-classes/:id/postpones?passId=       — 미룬 내역(원래 회차 → 옮겨간 회차)

import { api } from "@/app/api.client";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { RegularClassPostponeResponse, TicketResponse } from "@/app/endpoint/ticket.endpoint";

/** 시작 전 수강권 전부(page 없이). 실패하면 빈 목록 — 메뉴만 안 뜬다 */
export const getUpcomingRegularClassTicketsAction = async ({ id }: { id: number }): Promise<TicketResponse[]> => {
  try {
    const res = await api.ticket.listByRegularClass({ id, type: 'upcoming' });
    return 'tickets' in res ? res.tickets : [];
  } catch {
    return [];
  }
};

/** 이 패스로 미룬 내역 전부(최근 순). 실패하면 빈 목록 */
export const getRegularClassPostponesAction = async ({ id, passId }: { id: number; passId: number }): Promise<RegularClassPostponeResponse[]> => {
  try {
    const res = await api.ticket.listPostponesByRegularClass({ id, passId });
    return 'postpones' in res ? res.postpones : [];
  } catch {
    return [];
  }
};

export const postponeRegularClassTicketAction = async ({ id, ticketId }: { id: number; ticketId: number }): Promise<{ success: boolean } | GuinnessErrorCase> => {
  try {
    return await api.ticket.postponeByRegularClass({ id, ticketId });
  } catch {
    return { code: 'UNKNOWN_ERROR', message: '' };
  }
};
