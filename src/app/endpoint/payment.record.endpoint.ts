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
  /** 번들(paymentId가 BD로 시작) 결제일 때 구성된 수강권 목록. 그 외 결제에선 빈 배열 또는 미포함. */
  tickets?: BundleTicketResponse[];
}

export type BundleTicketResponse = {
  id: number;
  status: string;
  lesson: {
    id: number;
    title: string;
    startDate?: string;        // 'YYYY-MM-DD HH:mm'
    date?: string;             // 'YYYY.MM.DD(요일) 오전/오후 HH:mm' 포맷된 표시용
    thumbnailUrl?: string;
  };
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
export type ManualPaymentItem = 'lesson' | 'lesson-group' | 'pass-plan' | 'practice-room' | 'bundle';

export type CreateManualPaymentRecordRequest = {
  methodType: ManualPaymentMethodType;
  item: ManualPaymentItem;
  itemId: number;
  targetUserId: number;
  /** 직원이 편집한 실결제 금액 (admin 현장결제 등). 미지정이면 서버가 상품가로 계산. */
  amount?: number;
  depositor?: string;
  discounts?: DiscountResponse[];
}

export type GetPaymentRecordsParameter = {
  page?: number;
}

export const GetPaymentRecords: Endpoint<GetPaymentRecordsParameter, GetPaymentRecordListResponse> = {
  method: "get",
  path: `/paymentRecords`,
  queryParams: ['page'],
};

export const GetPaymentRecordDetail: Endpoint<PaymentIdParameter, GetPaymentRecordResponse> = {
  method: 'get',
  path: (e) => `/paymentRecords/${e.paymentId}`,
}

export const CreateManualPaymentRecord: Endpoint<CreateManualPaymentRecordRequest, GetPaymentRecordResponse> = {
  method: 'post',
  path: '/paymentRecords/manual',
  bodyParams: ['methodType', 'item', 'itemId', 'targetUserId', 'amount', 'depositor', 'discounts']
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

export type KioskPendingPaymentItemRequest = {
  lessonId: number;
  discounts?: PaymentDiscount[];
}

export type PaymentDiscount = {
  amount: number;
  type: string;
  key: string;
  itemId: number;
}

export type KioskPendingPaymentRequest = {
  items: KioskPendingPaymentItemRequest[];
  targetUserId: number;
}

export type KioskPaymentResultItem = {
  lesson: {
    id: number;
    title?: string;
  };
  reason?: string;
}

export type KioskPendingPaymentResponse = {
  lessons: KioskPaymentResultItem[];
}

export const CreateKioskPendingPayment: Endpoint<KioskPendingPaymentRequest, KioskPendingPaymentResponse> = {
  method: 'post',
  path: '/paymentRecords/kiosk',
  bodyParams: ['items', 'targetUserId']
}

export enum PaymentRecordStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Settled = 'Settled',
  Failed = 'Failed',
  CancelPending = 'CancelPending',
}
