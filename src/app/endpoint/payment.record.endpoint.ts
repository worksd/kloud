import { Endpoint } from "@/app/endpoint/index";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export type GetPaymentRecordListResponse = {
  paymentRecords: GetPaymentRecordResponse[];
}

export type GetPaymentRecordResponse = {
  id: number
  status: PaymentRecordStatus
  paymentId: string
  method: string;
  createdAt: string;
  amount: number;
  depositor: string;
  ticket?: TicketResponse
  pass?: GetPassResponse
}

export const GetPaymentRecords: Endpoint<object, GetPaymentRecordListResponse> = {
  method: "get",
  path: `/paymentRecords`,
};

export enum PaymentRecordStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}
