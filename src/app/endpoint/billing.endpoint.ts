import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type GetBillingResponse = {
  billingKey: string;
  userId: number;
  cardNumber: string;
  cardName: string;
}

export type CreateBillingRequest = {
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
}

export type DeleteBillingRequest = {
  billingKey: string;
}

export const List: Endpoint<object, GetBillingResponse> = {
  method: 'get',
  path: '/billing',
}

export const Create: Endpoint<CreateBillingRequest, GetBillingResponse> = {
  method: 'post',
  path: '/billing',
}

export const Delete: Endpoint<DeleteBillingRequest, SimpleResponse> = {
  method: 'delete',
  path: '/billing',
}