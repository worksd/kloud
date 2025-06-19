import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { PaymentItemType } from "@/app/endpoint/payment.endpoint";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";

export type GetSubscriptionResponse = {
  subscriptionId: string;
  orderName: string;
  status: 'Active' | 'Cancelled' | 'Failed'
  studio?: GetStudioResponse;
}

export type ListSubscriptionResponse = {
  subscriptions: GetSubscriptionResponse[]
}

export type CreateSubscriptionParameter = {
  item: PaymentItemType,
  itemId: number
  billingKey: string
}

export type CreateSubscriptionResponse = {
  schedulePaymentRecord: GetPaymentRecordResponse;
  paymentId: string;
  subscription: GetSubscriptionResponse;
}

export const List: Endpoint<object, ListSubscriptionResponse> = {
  method: 'get',
  path: '/subscription',
}

export const Create: Endpoint<CreateSubscriptionParameter, CreateSubscriptionResponse> = {
  method: 'post',
  path: '/subscription',
  bodyParams: ['item', 'itemId', 'billingKey'],
}
