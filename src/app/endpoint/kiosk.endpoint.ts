import { Endpoint, NoParameter } from "@/app/endpoint";
import { GetPaymentResponse, PaymentDiscount } from "@/app/endpoint/payment.endpoint";

export type KioskStatus = 'Active' | 'Inactive';

export type GetKioskPaymentRequest = {
  targetUserId: number;
  item: string;
  itemId: number;
};

export const GetKioskPayment: Endpoint<GetKioskPaymentRequest, GetPaymentResponse> = {
  method: 'get',
  path: '/kiosks/payment',
  queryParams: ['targetUserId', 'item', 'itemId'],
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
