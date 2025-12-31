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
  cancelledAt?: string;
  cancelReason?: string;
  confirmedAt?: string;
  accountTransferConfirmDate?: string;
  refundAmount?: number;
  refoundAccountNumber?: string;
  refundAccountBank?: string;
  refundDepositor?: string;
  isRefundable?: boolean;
}

export type PaymentIdParameter = {
  paymentId: string
}

export type RequestAccountTransfer = {
  item: string;
  itemId: number;
  depositor: string;
  targetUserId?: number;
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
  bodyParams: ['depositor', 'itemId', 'item', 'targetUserId']
}

export const CreateFreePaymentRecord: Endpoint<CreateFreePaymentRecord, GetPaymentRecordResponse> = {
  method: 'post',
  path: '/paymentRecords/free',
  bodyParams: ['item', 'itemId'],
}

export type RefundPassResponse = {
  usedCount?: number;
  totalCount?: number;
  usedLessons?: Array<{
    id: number;
    name: string;
    imageUrl?: string;
    date?: string;
  }>;
}

export type GetRefundPreviewResponse = {
  paymentId: string;
  productName: string;
  methodType: PaymentMethodType;
  amount: number;
  refundAmount: number;
  refundAccountNumber?: string | null;
  refundAccountBank?: string | null;
  refundDepositor?: string | null;
  cardNumber?: string | null;
  methodLabel?: string | null;
  pass?: RefundPassResponse;
  refundReconsiderMessage: string;
}

export const GetRefundPreview: Endpoint<PaymentIdParameter, GetRefundPreviewResponse> = {
  method: 'get',
  path: (e) => `/paymentRecords/${e.paymentId}/refund-preview`,
}

export type RequestRefundRequest = {
  paymentId: string;
  reason: string;
  requester: 'CUSTOMER';
}

export const RequestRefund: Endpoint<RequestRefundRequest, GetPaymentRecordResponse> = {
  method: 'delete',
  path: (e) => `/paymentRecords/${e.paymentId}/cancel`,
  bodyParams: ['reason', 'requester']
}

export enum PaymentRecordStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Settled = 'Settled',
  Failed = 'Failed',
  CancelPending = 'CancelPending',
}
