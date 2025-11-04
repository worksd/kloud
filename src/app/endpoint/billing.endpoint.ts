import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

export type ListBillingResponse = {
  billings: GetBillingResponse[]
}

export type GetBillingResponse = {
  billingKey?: string;
  cardNumber?: string;
  cardName?: string;
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