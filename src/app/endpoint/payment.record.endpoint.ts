import { Endpoint } from "@/app/endpoint/index";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PaymentItemType, PaymentMethodType } from "@/app/endpoint/payment.endpoint";

export type GetPaymentRecordListResponse = {
  paymentRecords: GetPaymentRecordResponse[];
}

export type GetPaymentRecordResponse = {
  id: number
  status: PaymentRecordStatus
  paymentId: string
  paymentMethodLabel: string;
  methodType: PaymentMethodType;
  createdAt: string;
  amount: number;
  depositor?: string;
  productName: string;
  receiptUrl?: string;
}

export type PaymentIdParameter = {
  paymentId: string
}

export type RequestAccountTransfer = {
  item: PaymentItemType;
  itemId: number;
  depositor: string
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

export enum PaymentRecordStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Settled = 'Settled'
}
