import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetSubscriptionResponse = {
  subscriptionId: string;
  orderName: string;
  status: 'Active' | 'Cancelled' | 'Failed'
  studio: GetStudioResponse;
}

export type ListSubscriptionResponse = {
  subscriptions: GetSubscriptionResponse[]
}

export const List: Endpoint<object, ListSubscriptionResponse> = {
  method: 'get',
  path: 'subscription',
}
