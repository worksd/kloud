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

// GET /kiosks/admin/payment — 관리자 모드: 결제 상세 없이 paymentId만 발급받는 경량 엔드포인트
export type GetKioskAdminPaymentRequest = {
  item: string;   // 'lesson' | 'pass-plan'
  itemId: number;
};

export type GetKioskAdminPaymentResponse = {
  paymentId: string;
};

export const GetKioskAdminPayment: Endpoint<GetKioskAdminPaymentRequest, GetKioskAdminPaymentResponse> = {
  method: 'get',
  path: '/kiosks/admin/payment',
  queryParams: ['item', 'itemId'],
};

export type KioskPaymentType = 'card' | 'cash';

/**
 * 결제/패스사용으로 발급된 수강권 상태.
 * 학원이 자동 사용처리(studio.ticketAutoUse = SameDayOnSite)를 켜면 당일 수업은
 * 결제 즉시 'Used'로 발급되고 qrCodeUrl·rank가 전부 null로 내려온다 — 체크인 불필요.
 */
export type KioskTicketStatus = 'Paid' | 'Used' | 'Pending' | 'Cancelled' | 'CancelPending';

/**
 * 발급된 수강권 요약. 수강권을 발급하는 상품(수업)에만 채워지고
 * 패스권 구매·연습실 예약 등은 null.
 */
export type KioskTicketSummary = {
  id: number;
  status: KioskTicketStatus;
};

// ① POST /kiosks/payments — Pending 생성 (card) / 즉시 Completed (cash)
//    응답의 amount가 KIS 단말에 매입 요청할 금액
export type StartKioskPaymentRequest = {
  targetUserId: number;
  kioskId: number;
  paymentId: string;
  type: KioskPaymentType;
  /** 직원이 편집한 실결제 금액 (admin). 미지정이면 서버가 상품가-할인으로 계산. */
  amount?: number;
  discounts?: PaymentDiscount[];
  // 연습실 예약(practice-room)일 때 필수 — 선택 시간대(KST ISO). amount는 서버가 계산하므로 미전송.
  startDate?: string;
  endDate?: string;
};

export type StartKioskPaymentResponse = {
  paymentId: string;
  status: string;          // 'Pending' (card) | 'Completed' (cash)
  amount: number;          // 카드: 단말 매입 금액
  qrCodeUrl: string | null;
  receiptData: string;
  /** 레슨 결제로 티켓이 즉시 발급된 경우(cash/free) 입장 번호 라벨. 카드(Pending)는 보통 null — /complete에서 채워짐. */
  rank?: string | null;
  /** 'priority' | 'normal'. 그 외 null */
  rankType?: 'priority' | 'normal' | null;
  /**
   * ⚠️ 현재 BE 미포함 — 현금·무료는 이 시점에 발급까지 끝나지만 응답 DTO에 ticket이 없다.
   * BE가 추가하면 자동 사용처리(Used) 안내가 현금 결제에서도 그대로 뜬다.
   */
  ticket?: KioskTicketSummary | null;
};

export const StartKioskPayment: Endpoint<StartKioskPaymentRequest, StartKioskPaymentResponse> = {
  method: 'post',
  path: '/kiosks/payments',
  bodyParams: ['targetUserId', 'kioskId', 'paymentId', 'type', 'amount', 'discounts', 'startDate', 'endDate'],
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
  /**
   * 연습실 예약(practice-room) 결제일 때 예약 시간대 (KST 'YYYY.MM.DD HH:mm').
   * StartKioskPayment에 보낸 값과 동일한 값을 그대로 재전송한다 — 서버가 complete 시점에
   * 예약을 확정할 때 필요. 대관이 아닌 결제(수업/패스권/번들)에서는 미전송.
   */
  startDate?: string;
  endDate?: string;
};

export type CompleteKioskPaymentResponse = {
  paymentId: string;
  status: string;          // 'Completed'
  qrCodeUrl: string | null;
  receiptData?: string;
  /** 카드 결제 흐름이라 'card' 고정 */
  paymentType?: 'card';
  /** 카드 매입 완료 시점이라 'completed' 고정 */
  receiptType?: 'completed';
  /** 레슨 결제(LT-*)일 때 입장 번호 라벨 (예: "No. 7 (A Group)"). 그 외 null */
  rank?: string | null;
  /** 'priority' | 'normal'. 그 외 null */
  rankType?: 'priority' | 'normal' | null;
  /**
   * 발급된 수강권 요약. 수업 결제인데 null이면 발급 실패, status='Used'면 자동 사용처리(출석까지 완료).
   * 발급 성공 판정은 qrCodeUrl 유무가 아니라 이 필드로 한다.
   */
  ticket?: KioskTicketSummary | null;
};

export const CompleteKioskPayment: Endpoint<CompleteKioskPaymentRequest, CompleteKioskPaymentResponse> = {
  method: 'post',
  path: (e) => `/kiosks/payments/${e.paymentId}/complete`,
  bodyParams: ['targetUserId', 'kioskId', 'authNo', 'authDate', 'vanKey', 'totalAmount', 'cardBrand', 'cardNumber', 'vanResponse', 'startDate', 'endDate'],
};

// (중간 실패) DELETE /kiosks/payments/:paymentId — Pending soft-delete
//   단말 매입 전 사용자 취소 / 매입 자체 실패 시.
//   reason: 폐기 사유 진단용 — KIS VAN 응답 raw를 JSON 문자열로 동봉.
export type DiscardKioskPaymentRequest = {
  paymentId: string;
  kioskId: number;
  reason?: string;
};

export type DiscardKioskPaymentResponse = {
  success: boolean;
};

export const DiscardKioskPayment: Endpoint<DiscardKioskPaymentRequest, DiscardKioskPaymentResponse> = {
  method: 'delete',
  path: (e) => `/kiosks/payments/${e.paymentId}`,
  bodyParams: ['kioskId', 'reason'],
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
  /** 레슨에 패스권을 사용해 티켓이 발급된 경우 입장 번호 라벨. 룸/스튜디오권은 null */
  rank?: string | null;
  /** 'priority' | 'normal'. 그 외 null */
  rankType?: 'priority' | 'normal' | null;
  /** 발급된 수강권 요약. status='Used'면 자동 사용처리(출석까지 완료). 연습실 예약은 응답 스키마 자체가 달라 미포함. */
  ticket?: KioskTicketSummary | null;
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
  /** KIS VAN raw 응답 — 카드 결제 재발급 시 card 메타가 비어 있으면 여기서 추출. */
  vanResponse?: Record<string, unknown> | null;
  lesson?: KioskPaymentRecordDetailLesson | null;
  qrCodeUrl?: string;
  /** 레슨 결제로 Paid 티켓이 있을 때 입장 번호 라벨. 그 외 null — 재발급 영수증의 입장번호로 사용. */
  rank?: string | null;
  /** 'priority' | 'normal'. 그 외 null */
  rankType?: 'priority' | 'normal' | null;
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

/**
 * 전화번호 입력 패드 형태 — 'Short'면 뒷 4자리만, 'Default'면 전체 번호(기존).
 * 'Short'일 때 회원 검색은 matchType 'PhoneSuffix'(끝자리 일치)로 보낸다. 모든 전화 입력 UI 분기가 이 값 하나만 본다.
 */
export type KioskPhonePadType = 'Short' | 'Default';

// 키오스크 사용 형태 — 'kiosk'(무인 키오스크) | 'admin'(상담실 태블릿, 직원이 앞에 앉혀놓고 진행)
//                     | 'member'(회원 셀프 출석 — 홈 없이 번호부터 받고 오늘 수업 출석을 제안)
export type KioskMode = 'kiosk' | 'admin' | 'member';

export type KioskResponse = {
  id: number;
  name: string;
  status: KioskStatus;
  /** 'kiosk'면 무인 키오스크 UI, 'admin'이면 태블릿 상담실 UI, 'member'면 회원 셀프 출석 UI로 진입점이 갈린다. 미지정이면 'kiosk' 취급. */
  mode?: KioskMode;
  lastSeenAt: string | null;
  imageUrl: string | null;
  canCheckIn: boolean;
  canPurchase: boolean;
  /** 연습실 예약 카드 노출 여부. */
  canBookRoom?: boolean;
  /** 수업 출석 체크 카드 노출 여부. */
  canLessonAttendance?: boolean;
  /** 키오스크별 관리자 모드 진입 비밀번호 (BE 설정값). 미설정이면 관리자 모드 진입 불가. */
  password?: string;
  /** 전화번호 입력 패드 형태. 미지정이면 'Default'(전체 번호) 취급. */
  phonePadType?: KioskPhonePadType;
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

// ════════════════════ 다중결제(바스켓) — /kiosks/payment-groups (igin 포팅) ════════════════════
// 여러 수업을 한 번의 카드 승인으로 결제. 상품마다 payment_record가 따로 생기고 paymentGroupId로 묶인다.
//  ① preview  금액 계산 + paymentGroupId 발급(서버가 발급, 클라 생성 금지, 호출마다 새 id → 마지막 값 사용)
//  ② create   결제건 N개 생성 — 현금/무료는 즉시 Completed, 카드는 Pending → 단말 승인(inCustomerUuid=paymentGroupId)
//  ③ complete 승인 반영 + 일괄 발급 (멱등)
//  DELETE     단말 매입 전 이탈 시 Pending 폐기
export type PaymentGroupItemRequest = {
  /** 담을 수 있는 건 lesson · pass-plan 뿐. 정기수업/연습실/번들은 단건 결제 */
  item: 'lesson' | 'pass-plan';
  itemId: number;
  /** item당 최대 1개 */
  discounts?: PaymentDiscount[];
};

export type PreviewPaymentGroupRequest = {
  kioskId: number;
  targetUserId: number;
  items: PaymentGroupItemRequest[];
};

/** preview 응답 항목 — purchasable=false는 에러가 아니라 사유 코드로 온다. 화면에서 걸러야 create가 막히지 않는다 */
export type PaymentGroupPreviewItem = {
  item: string;
  itemId: number;
  productName?: string;
  price: number;
  discountAmount: number;
  amount: number;
  purchasable: boolean;
  /** SOLD_OUT · ALREADY_REGISTERED · INVALID_STATUS · PRICE_UNAVAILABLE */
  reason?: string | null;
};

export type PreviewPaymentGroupResponse = {
  paymentGroupId: string;
  totalAmount: number;
  items: PaymentGroupPreviewItem[];
};

export const PreviewKioskPaymentGroup: Endpoint<PreviewPaymentGroupRequest, PreviewPaymentGroupResponse> = {
  method: 'post',
  path: '/kiosks/payment-groups/preview',
  bodyParams: ['kioskId', 'targetUserId', 'items'],
};

export type CreatePaymentGroupRequest = {
  kioskId: number;
  targetUserId: number;
  /** preview에서 받은 값 그대로 */
  paymentGroupId: string;
  type: 'card' | 'cash';
  items: PaymentGroupItemRequest[];
};

/** create/complete 응답의 발급물 항목. 카드는 complete 응답에, 현금/무료는 create 응답에 채워진다 */
export type PaymentGroupIssuedItem = {
  item?: string;
  itemId?: number;
  paymentId: string;
  amount: number;
  productName?: string;
  qrCodeUrl?: string | null;
  rank?: string | null;
  ticket?: KioskTicketSummary | null;
};

export type PaymentGroupResponse = {
  paymentGroupId: string;
  /** 카드: Pending / 현금·무료: Completed */
  status: string;
  /** ★ 단말에 매입 요청할 금액 (preview 금액이 아니라 이 값) */
  totalAmount: number;
  /** 현금이라도 합산 0원이면 'free' */
  paymentType?: string;
  receiptType?: string;
  items: PaymentGroupIssuedItem[];
};

export const CreateKioskPaymentGroup: Endpoint<CreatePaymentGroupRequest, PaymentGroupResponse> = {
  method: 'post',
  path: '/kiosks/payment-groups',
  bodyParams: ['kioskId', 'targetUserId', 'paymentGroupId', 'type', 'items'],
};

export type CompletePaymentGroupRequest = {
  paymentGroupId: string;
  targetUserId: number;
  kioskId: number;
  authNo: string;
  authDate: string;
  vanKey: string;
  /** 단말 매입가 그대로 — 그룹 합계와 다르면 KIOSK_PAYMENT_AMOUNT_MISMATCH */
  totalAmount: number;
  cardBrand?: string;
  cardNumber?: string;
  /** KIS raw — 객체로 보낸다(문자열이면 400) */
  vanResponse?: Record<string, unknown>;
};

export const CompleteKioskPaymentGroup: Endpoint<CompletePaymentGroupRequest, PaymentGroupResponse> = {
  method: 'post',
  path: (e) => `/kiosks/payment-groups/${e.paymentGroupId}/complete`,
  bodyParams: ['targetUserId', 'kioskId', 'authNo', 'authDate', 'vanKey', 'totalAmount', 'cardBrand', 'cardNumber', 'vanResponse'],
};

export type DiscardPaymentGroupRequest = {
  paymentGroupId: string;
  kioskId: number;
  /** 폐기 사유 진단용 — { status: 'fail' | 'canceled', kis: <KIS raw> } 객체 */
  reason?: Record<string, unknown>;
};

export const DiscardKioskPaymentGroup: Endpoint<DiscardPaymentGroupRequest, DiscardKioskPaymentResponse> = {
  method: 'delete',
  path: (e) => `/kiosks/payment-groups/${e.paymentGroupId}`,
  bodyParams: ['kioskId', 'reason'],
};

// ════════════════════ member 모드 요약 — GET /kiosks/students/summary (igin 포팅) ════════════════════
export type KioskStudentSummaryRequest = {
  kioskId: number;
  targetUserId: number;
};

export type KioskSummaryTicket = {
  ticketId?: number;
  /** 표시·출석은 lessonId ?? id */
  lessonId?: number;
  id?: number;
  title?: string;
  /** 'HH:mm' */
  startTime?: string;
  duration?: number;
  artistName?: string;
  roomName?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  imageUrl?: string;
  isAttended?: boolean;
  /** 'HH:mm' */
  attendedAt?: string | null;
};

export type KioskSummaryUnpaid = {
  paymentId: string;
  productName?: string;
  amount: number;
  /** 'yyyy-MM-dd HH:mm' */
  issuedAt?: string;
};

export type KioskSummaryPass = {
  passId?: number;
  id?: number;
  name?: string;
  tag?: string | null;
  /** 'yyyy-MM-dd' */
  startDate?: string;
  endDate?: string;
};

export type KioskStudentSummaryResponse = {
  studentName?: string | null;
  studentId?: number;
  /** refundAccount* 필드가 함께 오지만 화면에 절대 그리지 않는다 */
  user?: { id: number; name?: string; nickName?: string; phone?: string; profileImageUrl?: string };
  todayTickets?: KioskSummaryTicket[];
  unpaidPayments?: KioskSummaryUnpaid[];
  activePasses?: KioskSummaryPass[];
};

export const GetKioskStudentSummary: Endpoint<KioskStudentSummaryRequest, KioskStudentSummaryResponse> = {
  method: 'get',
  path: '/kiosks/students/summary',
  queryParams: ['kioskId', 'targetUserId'],
};

// POST /kiosks/attendances — member 모드 출석. body는 전부 정수. 한 번에 1건씩 보낸다
export type KioskAttendanceRequest = {
  kioskId: number;
  targetUserId: number;
  lessonIds: number[];
};

export type KioskAttendanceResult = {
  lessonId: number;
  ok: boolean;
  /** 'ALREADY_ATTENDED' 등 */
  reason?: string;
  ticket?: KioskTicketSummary | null;
};

export type KioskAttendanceResponse = {
  results: KioskAttendanceResult[];
};

export const CreateKioskAttendance: Endpoint<KioskAttendanceRequest, KioskAttendanceResponse> = {
  method: 'post',
  path: '/kiosks/attendances',
  bodyParams: ['kioskId', 'targetUserId', 'lessonIds'],
};
