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

export type CreateSubscriptionParameter = {
  item: string,
  itemId: number
  billingKey: string
  /** 정기수업 시작 회차 id — item='lesson-group'일 때만 서버가 읽는다. payment.endpoint의 firstLessonId 주석 참고 */
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
  bodyParams: ['item', 'itemId', 'billingKey', 'firstLessonId'],
}

export const Cancel: Endpoint<CancelSubscriptionParameter, SimpleSubscriptionResponse> = {
  method: 'delete',
  path: (e) => `/subscription/${e.subscriptionId}`,
  pathParams: ['subscriptionId'],
  bodyParams: ['reason', 'requester']
}