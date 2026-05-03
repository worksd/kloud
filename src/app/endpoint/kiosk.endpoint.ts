import { Endpoint, NoParameter } from "@/app/endpoint";
import { GetPaymentResponse, PaymentDiscount } from "@/app/endpoint/payment.endpoint";

export type KioskStatus = 'Active' | 'Inactive';

export type GetKioskPaymentRequest = {
  kioskId: number;
  targetUserId: number;
  item: string;
  itemId: number;
};

export const GetKioskPayment: Endpoint<GetKioskPaymentRequest, GetPaymentResponse> = {
  method: 'get',
  path: '/kiosks/payment',
  queryParams: ['kioskId', 'targetUserId', 'item', 'itemId'],
};

export type KioskPaymentType = 'card' | 'cash';

export type CompleteKioskPaymentRequest = {
  targetUserId: number;
  kioskId: number;
  paymentId: string;
  type: KioskPaymentType;
  authNo?: string;
  authDate?: string;
  vanKey?: string;
  totalAmount?: number;
  cardBrand?: string;
  cardNumber?: string;
  vanResponse?: Record<string, unknown>;
  discounts?: PaymentDiscount[];
};

export type CompleteKioskPaymentResponse = {
  paymentId: string;
  status: string;
  qrCodeUrl: string | null;
  receiptData: string;
};

export const CompleteKioskPayment: Endpoint<CompleteKioskPaymentRequest, CompleteKioskPaymentResponse> = {
  method: 'post',
  path: '/kiosks/payments',
  bodyParams: [
    'targetUserId', 'kioskId', 'paymentId', 'type',
    'authNo', 'authDate', 'vanKey', 'totalAmount',
    'cardBrand', 'cardNumber', 'vanResponse', 'discounts',
  ],
};

export type UseKioskPassRequest = {
  passId: number;
  targetUserId: number;
  kioskId: number;
  lessonId?: number;
  studioRoomId?: number;
  startDate?: string;
  endDate?: string;
};

export type UseKioskPassResponse = {
  success?: boolean;
  id?: number;
};

export const UseKioskPass: Endpoint<UseKioskPassRequest, UseKioskPassResponse> = {
  method: 'post',
  path: (e) => `/kiosks/passes/${e.passId}/use`,
  bodyParams: ['targetUserId', 'kioskId', 'lessonId', 'studioRoomId', 'startDate', 'endDate'],
};

// 키오스크 관리자 모드 — 결제 record 목록 / 취소
// 백엔드: GET /kiosks/:id/paymentRecords → KioskPaymentRecordListResponse
export type KioskPaymentRecord = {
  id: number;
  paymentId: string;
  status: string;
  methodType: string;
  amount: number;
  productName: string | null;
  userId: number;
  cancelledAt: string | null;
  // 카드 단말 취소를 위한 메타 (KIS 응답값)
  authNo: string | null;
  authDate: string | null;
  vanKey: string | null;
  totalAmount: number | null;
};

export type ListKioskPaymentsRequest = {
  kioskId: number;
};

export type ListKioskPaymentsResponse = {
  paymentRecords: KioskPaymentRecord[];
};

export const ListKioskPayments: Endpoint<ListKioskPaymentsRequest, ListKioskPaymentsResponse> = {
  method: 'get',
  path: (e) => `/kiosks/${e.kioskId}/paymentRecords`,
};

export type CancelKioskPaymentRequest = {
  paymentId: string;
  kioskId: number;
};

export type CancelKioskPaymentResponse = {
  paymentId: string;
  status: string;
};

export const CancelKioskPayment: Endpoint<CancelKioskPaymentRequest, CancelKioskPaymentResponse> = {
  method: 'post',
  path: (e) => `/kiosks/payments/${e.paymentId}/cancel`,
  bodyParams: ['kioskId'],
};

export type KioskResponse = {
  id: number;
  name: string;
  status: KioskStatus;
  lastSeenAt: string | null;
  imageUrl: string | null;
  canCheckIn: boolean;
  canPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};

export type KioskListResponse = {
  kiosks: KioskResponse[];
};

export const GetKiosks: Endpoint<NoParameter, KioskListResponse> = {
  method: 'get',
  path: '/kiosks',
};

export type GetKioskDetailRequest = {
  kioskId: number;
};

// kiosk 상세 — 영수증 하단 안내 문구 등 kiosk별 설정 포함
export type KioskDetailResponse = KioskResponse & {
  receiptFooter?: string;
};

export const GetKioskDetail: Endpoint<GetKioskDetailRequest, KioskDetailResponse> = {
  method: 'get',
  path: (e) => `/kiosks/${e.kioskId}`,
};
