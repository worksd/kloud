import { Endpoint } from "@/app/endpoint/index";
import { PaymentMethodType, DiscountResponse } from "@/app/endpoint/payment.endpoint";
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
  cardNumber?: string;
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
  discounts?: DiscountResponse[];
}

export type PaymentIdParameter = {
  paymentId: string
}

export type RequestDiscountParameter = {
  amount: number;
  type: string;
  key: string;
  itemId: number;
}

export type ManualPaymentMethodType = 'credit' | 'pass' | 'account_transfer' | 'admin' | 'free' | 'billing';
export type ManualPaymentItem = 'lesson' | 'pass-plan' | 'membership-plan';

export type CreateManualPaymentRecordRequest = {
  methodType: ManualPaymentMethodType;
  item: ManualPaymentItem;
  itemId: number;
  targetUserId: number;
  depositor?: string;
}

export const GetPaymentRecords: Endpoint<object, GetPaymentRecordListResponse> = {
  method: "get",
  path: `/paymentRecords`,
};

export const GetPaymentRecordDetail: Endpoint<PaymentIdParameter, GetPaymentRecordResponse> = {
  method: 'get',
  path: (e) => `/paymentRecords/${e.paymentId}`,
}

export const CreateManualPaymentRecord: Endpoint<CreateManualPaymentRecordRequest, GetPaymentRecordResponse> = {
  method: 'post',
  path: '/paymentRecords/manual',
  bodyParams: ['methodType', 'item', 'itemId', 'targetUserId', 'depositor']
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
