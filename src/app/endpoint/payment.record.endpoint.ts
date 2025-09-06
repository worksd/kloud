import { Endpoint } from "@/app/endpoint/index";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetPaymentRecordListResponse = {
  paymentRecords: GetPaymentRecordResponse[];
}

export type GetPaymentRecordResponse = {
  id: number
  status: PaymentRecordStatus
  paymentId: string
  paymentMethodLabel: string;
  methodType?: PaymentMethodType;
  createdAt: string;
  amount: number;
  depositor?: string;
  productName: string;
  productImageUrl?: string;
  productRoute?: string;
  receiptUrl?: string;
  studio?: GetStudioResponse;
  productDescription?: string;
  paymentScheduledAt?: string;
}

export type PaymentIdParameter = {
  paymentId: string
}

export type RequestAccountTransfer = {
  item: string;
  itemId: number;
  depositor: string
}

export type CreateFreePaymentRecord = {
  item: string;
  itemId: number;
}

export const GetPaymentRecords: Endpoint<object, GetPaymentRecordListResponse> = {
  method: "get",
  path: `/paymentRecords`,
};

export const GetPaymentRecordDetail: Endpoint<PaymentIdParameter, GetPaymentRecordResponse> = {
  method: 'get',
  path: (e) => `/paymentRecords/${e.paymentId}`,
}

export const RequestAccountTransfer: Endpoint<RequestAccountTransfer, GetPaymentRecordResponse> = {
  method: 'post',
  path: (e) => `/paymentRecords/account-transfer`,
  bodyParams: ['depositor', 'itemId', 'item']
}

export const CreateFreePaymentRecord: Endpoint<CreateFreePaymentRecord, GetPaymentRecordResponse> = {
  method: 'post',
  path: '/paymentRecords/free',
  bodyParams: ['item', 'itemId'],
}

export enum PaymentRecordStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Settled = 'Settled',
}
