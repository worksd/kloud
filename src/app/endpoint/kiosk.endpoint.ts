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

// ① POST /kiosks/payments — Pending 생성 (card) / 즉시 Completed (cash)
//    응답의 amount가 KIS 단말에 매입 요청할 금액
export type StartKioskPaymentRequest = {
  targetUserId: number;
  kioskId: number;
  paymentId: string;
  type: KioskPaymentType;
  discounts?: PaymentDiscount[];
};

export type StartKioskPaymentResponse = {
  paymentId: string;
  status: string;          // 'Pending' (card) | 'Completed' (cash)
  amount: number;          // 카드: 단말 매입 금액
  qrCodeUrl: string | null;
  receiptData: string;
};

export const StartKioskPayment: Endpoint<StartKioskPaymentRequest, StartKioskPaymentResponse> = {
  method: 'post',
  path: '/kiosks/payments',
  bodyParams: ['targetUserId', 'kioskId', 'paymentId', 'type', 'discounts'],
};

// ② POST /kiosks/payments/:paymentId/complete — Pending → Completed (KIS 매입 성공 후)
export type CompleteKioskPaymentRequest = {
  paymentId: string;
  targetUserId: number;
  kioskId: number;
  authNo: string;
  authDate: string;
  vanKey: string;
  totalAmount: number;
  cardBrand?: string;
  cardNumber?: string;
  vanResponse?: Record<string, unknown>;
};

export type CompleteKioskPaymentResponse = {
  paymentId: string;
  status: string;          // 'Completed'
  qrCodeUrl: string | null;
  receiptData: string;
};

export const CompleteKioskPayment: Endpoint<CompleteKioskPaymentRequest, CompleteKioskPaymentResponse> = {
  method: 'post',
  path: (e) => `/kiosks/payments/${e.paymentId}/complete`,
  bodyParams: ['targetUserId', 'kioskId', 'authNo', 'authDate', 'vanKey', 'totalAmount', 'cardBrand', 'cardNumber', 'vanResponse'],
};

// (중간 실패) DELETE /kiosks/payments/:paymentId — Pending soft-delete
//   단말 매입 전 사용자 취소 / 매입 자체 실패 시
export type DiscardKioskPaymentRequest = {
  paymentId: string;
  kioskId: number;
};

export type DiscardKioskPaymentResponse = {
  success: boolean;
};

export const DiscardKioskPayment: Endpoint<DiscardKioskPaymentRequest, DiscardKioskPaymentResponse> = {
  method: 'delete',
  path: (e) => `/kiosks/payments/${e.paymentId}`,
  bodyParams: ['kioskId'],
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
  // 패스권 사용 영수증/QR — 카드/현금 결제와 동일하게 영수증 인쇄에 사용
  paymentId?: string;
  qrCodeUrl?: string | null;
};

export const UseKioskPass: Endpoint<UseKioskPassRequest, UseKioskPassResponse> = {
  method: 'post',
  path: (e) => `/kiosks/passes/${e.passId}/use`,
  bodyParams: ['targetUserId', 'kioskId', 'lessonId', 'studioRoomId', 'startDate', 'endDate'],
};

// 키오스크 관리자 모드 — 결제 record 목록 / 취소
// 백엔드: GET /kiosks/:id/paymentRecords → KioskPaymentRecordListResponse
export type KioskPaymentRecordUser = {
  id: number;
  email?: string;
  status?: string;
  type?: string;
  name?: string;
  nickName?: string;
  profileImageUrl?: string;
  phone?: string;
  countryCode?: string;
};

export type KioskPaymentRecord = {
  id: number;
  paymentId: string;
  status: string;
  methodType: string;
  amount: number;
  productName: string | null;
  user: KioskPaymentRecordUser;
  createdAt: string;
  cancelledAt: string | null;
  // 카드 단말 취소를 위한 메타 (KIS 응답값)
  authNo: string | null;
  authDate: string | null;
  vanKey: string | null;
  totalAmount: number | null;
};

export type ListKioskPaymentsRequest = {
  kioskId: number;
  /** KST 기준 yyyy-MM-dd. 미지정 시 전체 조회 */
  date?: string;
  /** 1부터. 미지정 또는 0 이하면 페이지네이션 없이 전체 */
  page?: number;
};

export type ListKioskPaymentsResponse = {
  paymentRecords: KioskPaymentRecord[];
  /** page 파라미터로 호출 시 BE가 함께 내려주는 페이지네이션 메타 */
  totalPage?: number;
  page?: number;
};

export const ListKioskPayments: Endpoint<ListKioskPaymentsRequest, ListKioskPaymentsResponse> = {
  method: 'get',
  path: (e) => `/kiosks/${e.kioskId}/paymentRecords`,
  queryParams: ['date', 'page'],
};

// GET /kiosks/:id/paymentRecords/:paymentId — 영수증 재발급용 결제 기록 상세
export type KioskPaymentRecordDetailRequest = {
  kioskId: number;
  paymentId: string;
};

export type KioskPaymentRecordDetailDiscount = {
  name: string;
  amount: number;
  type?: string;
};

export type KioskPaymentRecordDetailCard = {
  cardNumber?: string;
  issuerName?: string;
  /** "일시불" 또는 "N개월" — BE가 변환해서 내려줌 */
  installmentLabel?: string;
  merchantNo?: string;
  authNo?: string;
  authDate?: string;
  vanKey?: string;
  approvedAmount?: number;
};

export type KioskPaymentRecordDetailLesson = {
  id: number;
  title: string;
  startDate?: string;
  duration?: number;
  artists?: { id: number; name?: string; nickName?: string }[];
};

export type KioskPaymentRecordDetailStudio = {
  name?: string;
  address?: string;
  businessRegistrationNumber?: string;
  representative?: string;
  phone?: string;
  receiptFooter?: string;
};

export type KioskPaymentRecordDetailResponse = {
  paymentId: string;
  status: string;
  productName?: string;
  method?: string;
  methodType?: string;
  amount: number;
  createdAt?: string;
  confirmedAt?: string;
  cancelledAt?: string | null;
  studio?: KioskPaymentRecordDetailStudio;
  discounts?: KioskPaymentRecordDetailDiscount[];
  card?: KioskPaymentRecordDetailCard | null;
  lesson?: KioskPaymentRecordDetailLesson | null;
  qrCodeUrl?: string;
};

export const GetKioskPaymentRecordDetail: Endpoint<KioskPaymentRecordDetailRequest, KioskPaymentRecordDetailResponse> = {
  method: 'get',
  path: (e) => `/kiosks/${e.kioskId}/paymentRecords/${e.paymentId}`,
};

// POST /kiosks/payments/:paymentId/cancel — Completed → Cancelled (관리자 취소).
// Pending 폐기는 위의 DiscardKioskPayment(DELETE) 사용.
export type CancelKioskPaymentRequest = {
  paymentId: string;
  targetUserId: number;
  kioskId: number;
};

export type CancelKioskPaymentResponse = {
  success: boolean;
};

export const CancelKioskPayment: Endpoint<CancelKioskPaymentRequest, CancelKioskPaymentResponse> = {
  method: 'post',
  path: (e) => `/kiosks/payments/${e.paymentId}/cancel`,
  bodyParams: ['targetUserId', 'kioskId'],
};

export type KioskResponse = {
  id: number;
  name: string;
  status: KioskStatus;
  lastSeenAt: string | null;
  imageUrl: string | null;
  canCheckIn: boolean;
  canPurchase: boolean;
  /** 키오스크별 관리자 모드 진입 비밀번호 (BE 설정값). 미설정이면 관리자 모드 진입 불가. */
  password?: string;
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
