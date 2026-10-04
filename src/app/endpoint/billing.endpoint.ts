import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type ListBillingResponse = {
  billings: GetBillingResponse[]
}

/**
 * GET /billing 의 한 건 / POST /billing 응답 (설정>결제 연동 가이드 2026-10-04).
 * - 목록: { billingKey, userId, cardNumber?, cardName?, createdAt? } — cardNumber 는 PortOne 마스킹 그대로('53890382****548*', 하이픈 없음),
 *   없으면 키 자체가 빠진다. createdAt 은 'yyyy-MM-dd HH:mm'(KST, 시간대 표기 없음). 서버가 정렬하지 않으므로 화면에서 createdAt 으로 정렬.
 * - 등록 성공: { billingKey, userId } 둘뿐 — 카드 정보는 GET /billing 재조회.
 * - PG 거절/타임아웃: HTTP 201 인데 본문이 { success: false, pgMessage } — 상태 코드가 아니라 본문으로 분기한다.
 */
export type GetBillingResponse = {
  billingKey?: string;
  userId?: number;
  cardNumber?: string;
  cardName?: string;
  createdAt?: string;
  success?: boolean;
  pgMessage?: string;
}

export type CreateBillingRequest = {
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
}

export type DeleteBillingResponse = {
  deletedAt: string
}

export type DeleteBillingRequest = {
  billingKey: string;
}

export const List: Endpoint<object, ListBillingResponse> = {
  method: 'get',
  path: '/billing',
}

export const Create: Endpoint<CreateBillingRequest, GetBillingResponse> = {
  method: 'post',
  path: '/billing',
  bodyParams: ['birthOrBusinessRegistrationNumber','cardNumber','passwordTwoDigits','expiryYear', 'expiryMonth']
}

export const Delete: Endpoint<DeleteBillingRequest, DeleteBillingResponse> = {
  method: 'delete',
  path: `/billing`,
  bodyParams: ['billingKey'],
}