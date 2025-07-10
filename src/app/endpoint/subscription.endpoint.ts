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
  bodyParams: ['item', 'itemId', 'billingKey'],
}

export const Cancel: Endpoint<CancelSubscriptionParameter, SimpleSubscriptionResponse> = {
  method: 'delete',
  path: (e) => `/subscription/${e.subscriptionId}`,
  pathParams: ['subscriptionId'],
  bodyParams: ['reason', 'requester']
}