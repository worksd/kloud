import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";

export type GetSubscriptionResponse = {
  subscriptionId: string;
  productName: string;
  productImageUrl?: string;
  status: 'Active' | 'Cancelled' | 'Failed'
  studio?: GetStudioResponse;
  startDate?: string;
  endDate?: string;
  paymentScheduledAt?: string;
}

export type ListSubscriptionResponse = {
  subscriptions: GetSubscriptionResponse[]
}

// POST /subscription — 무엇을 정기결제로 걸지는 paymentId 가 정한다(item·itemId 는 서버가 받지 않음).
// paymentId 가 없으면 PAYMENT_ID_REQUIRED, 앞머리가 상품 대응표에 없으면 INVALID_PARAMETER.
export type CreateSubscriptionParameter = {
  billingKey: string
  /** 결제번호 — 가격정책이면 pricePolicies[].paymentId(LP…), 아니면 결제 화면 응답 최상위 paymentId */
  paymentId: string
  /** 시작 회차 id(선택) — 서버가 읽지 않으면 무시된다 */
  firstLessonId?: number
}

export type CreateSubscriptionResponse = {
  paymentId: string;
  subscription: GetSubscriptionResponse;
}

export type SimpleSubscriptionResponse = {
  subscriptionId: string
}

export type CancelSubscriptionParameter = {
  subscriptionId: string
  reason: string
  requester: string
}

export const List: Endpoint<object, ListSubscriptionResponse> = {
  method: 'get',
  path: '/subscription',
}

export const Get: Endpoint<{ subscriptionId: string }, GetSubscriptionResponse> = {
  method: 'get',
  path: (e) => `/subscription/${e.subscriptionId}`,
  pathParams: ['subscriptionId'],
}

export const Create: Endpoint<CreateSubscriptionParameter, CreateSubscriptionResponse> = {
  method: 'post',
  path: '/subscription',
  bodyParams: ['billingKey', 'paymentId', 'firstLessonId'],
}

export const Cancel: Endpoint<CancelSubscriptionParameter, SimpleSubscriptionResponse> = {
  method: 'delete',
  path: (e) => `/subscription/${e.subscriptionId}`,
  pathParams: ['subscriptionId'],
  bodyParams: ['reason', 'requester']
}