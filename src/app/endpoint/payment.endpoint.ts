import { Endpoint } from "@/app/endpoint/index";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PaymentType } from "@/app/lessons/[id]/payment/payment.button";

export type GetPaymentRequest = {
  itemId: number
  item: string
  targetUserId?: number
  date?: string
  /** 연습실 필수 — 예약 시작 'YYYY-MM-DDTHH:mm' (KST). 서버가 이 구간으로 최종금액 계산 */
  startTime?: string
  /** 연습실 필수 — 예약 종료 'YYYY-MM-DDTHH:mm' (KST, 자정 넘기면 다음날) */
  endTime?: string
  /** 강사 경로 전용 — 강사가 자기 소속 학원의 수업을 조회할 때. 파트너는 생략(계정의 학원이 우선) */
  studioId?: number
}

export type DiscountPassRule = {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  remainingCount?: number | null;
  usageCount: number;
  targetType: string;
  targetValue?: string | null;
  targetLabel?: string | null;
  benefitType: string;
  benefitValue?: number | null;
  excludes?: { type: string; value?: string | null; label?: string | null }[];
  usable?: boolean;
}

export type DiscountResponse = {
  key: string;
  value: string;
  amount: number;
  type: string;
  itemId: number;
  description?: string;
  passRule?: DiscountPassRule;
}

export type CouponResponse = {
  id: number;
  name: string;
  discountAmount: number;
  type: string;
}

/** 가격 정책 판매 상태. Cancelled(판매 중단)는 결제 화면에 노출하지 않는다 — 이미 산 수강권은 유지된다. */
export type LessonPricePolicyStatus = 'Active' | 'Cancelled';

/**
 * 수업 가격 정책 — 한 수업을 "회차 수 × 가격" 조합으로 파는 방식 하나.
 * (예: '월 4회' 100,000 / '월 8회' 190,000)
 *
 * 응답은 항상 lessonCount 오름차순으로 정렬되어 온다 — 별도의 노출 순서 값은 없으므로 클라에서 재정렬하지 않는다.
 * 회당 가격은 BE가 아니라 UI에서 price/lessonCount로 계산한다.
 * (2026-08-08 후속 변경으로 originalPrice·badge는 계약에서 삭제됐다 — 할인 표시 없음)
 */
export type LessonPricePolicyResponse = {
  id: number;
  /**
   * 이 정책으로 결제할 때 쓰는 결제 id ('LGT…'). 결제 승인·환불·정산이 전부 이 id로 갈린다.
   * 학생이 정책을 고르면 최상위 paymentId 대신 이 값으로 결제한다.
   */
  paymentId: string;
  /** 수강생에게 보이는 방식 이름 (예: '월 4회'). 서버가 없으면 '{회차 수}회'로 채워 내려주지만 optional로 방어한다. */
  name?: string;
  /** 한 번에 판매하는 회차 수 (예: 1, 4, 8) */
  lessonCount: number;
  /** 실제 결제 금액. 이 옵션을 고르면 결제 상품가가 이 값이 된다. */
  price: number;
  /** 방식 설명 (예: '주 2회 4주 과정'). */
  description?: string;
  /** 기본 선택 대상. 한 수업에서 하나만 true. 없으면 회차 수 오름차순 첫 번째가 기본 선택된다. */
  isRecommended?: boolean;
  /** 결제 1건 기준으로 회차를 미룰 수 있는 횟수. 없으면 학원 기본값을 따른다. */
  postponeLimit?: number;
  /** 판매 상태. Cancelled면 결제 화면에서 제외. */
  status?: LessonPricePolicyStatus;
  /** 이 방식이 다니는 요일. 요일을 두지 않은 방식은 키 생략(그 수업의 모든 회차 수강).
   *  결제 응답은 'MON'~'SUN' 문자열, 수업 상세(GET /lessons/:id) 응답은 숫자(0=일~6=토)로 온다 — 둘 다 받는다. */
  days?: (DayOfWeek | number)[];
  /** 지금 결제하면 산 횟수만큼 수강권이 바로 나가는지. true면 결제도 통과한다. 구응답엔 없음. */
  usable?: boolean;
  /** usable=false일 때만 — 로케일 적용된 사유 문구가 그대로 온다 (코드값 아님). */
  reason?: string;
}

/** 판매 방식 요일 코드 (pricePolicies[].days) */
export type DayOfWeek = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export type GetPaymentResponse = {
  /**
   * 결제 대상 회원. 비회원(미로그인) 진입에서는 BE가 아예 내려주지 않는다 — 아이템 종류와 무관하게 nullable.
   * 결제 시점에 PaymentButton이 폰 인증 시트(GuestInfoBottomSheet)로 payer를 확보한다.
   */
  user?: GetUserResponse;
  /**
   * 회원이 보유한 패스권 목록 — 결제수단/할인이 아닌 별도 섹션으로 노출.
   * 과거에는 user.passes로 내려왔지만 user와 같은 레벨로 분리됨.
   */
  passes?: GetPassResponse[];
  /** 결제 페이지 진입 직후 강제 이동시킬 라우트. BE가 지정하면 결제 폼 대신 navigateMain. */
  redirectUrl?: string;
  price?: number;
  /**
   * 수업 가격 정책 — 정기로 파는 수업일 때 내려온다. 스펙상 위치는 lesson 하위이고 여기는 구버전 응답 폴백.
   * 존재하면 결제 화면에서 방식 선택 UI를 노출하고, 선택한 정책의 paymentId로 결제한다.
   * 선택된 옵션의 price가 결제 금액(상품가)이 된다.
   */
  pricePolicies?: LessonPricePolicyResponse[];
  methods: GetPaymentMethodResponse[];
  /**
   * 이 상품을 정기결제(구독)로 살 수 있는지 — 정기결제 UI 노출 판단 기준.
   * 타입별 판정이 비대칭이다:
   * - pass-plan: 기간형 혜택(Unlimited/UnlimitedWindow/Discount) 보유 여부만 본다 —
   *   true여도 등록 카드가 없을 수 있으니 cards가 비면 카드 등록 플로우 먼저.
   * - lesson: 가격 정책 존재 + '내 등록 카드(빌링) 보유'까지 검사 — true면 바로 구독 가능.
   *   비로그인 조회는 사실상 항상 false → 로그인 후 재조회로 갱신할 것.
   * - bundle/practice-room: 항상 false. (구응답에는 필드 없음 — undefined면 기존 동작 유지)
   */
  canSubscribe?: boolean;
  cards?: GetBillingResponse[];
  lesson?: GetLessonResponse;
  passPlan?: GetPassPlanResponse;
  /**
   * 번들(묶음) 결제 — LessonPaymentResponse 패턴처럼 nested 객체로 내려옴.
   * SimplePaymentResponse 공통 필드(user/methods/price/...)는 root에, 번들 전용은 이 안에.
   * methods에는 Pass/Billing이 자동 제외됨.
   */
  bundle?: {
    id: number;
    name: string;
    description?: string;
    /** 구성 lesson 합계가(할인 전). UI에서 strike-through 가격 표시에 사용. */
    originalPrice?: number;
    /** 번들 판매 기간 (KST). 'yyyy.MM.dd HH:mm' */
    startDate?: string;
    endDate?: string;
    /** (구) 번들 판매 종료 시각 (KST). 'yyyy.MM.dd HH:mm' — 폴백용 */
    closeDate?: string;
    /** 구성 수업 목록 */
    items: {
      itemType: string;     // 'lesson' 등
      itemId: number;
      title: string;
      price: number;
      startDate?: string;
      /** BE가 새로 내려주는 아이템 썸네일 URL. legacy thumbnailUrl 폴백. */
      imageUrl?: string;
      thumbnailUrl?: string;
    }[];
  };
  paymentId: string;
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  discounts?: DiscountResponse[];
  coupons?: CouponResponse[];
  /** 대관 이용료 환불 기준일(N일). 내려오면 대관 전용 환불 안내를 노출, 없으면 기본 환불 안내. */
  roomRefundDays?: number | null;
  studioRoom?: {
    id: number;
    name: string;
    /** 홀 이용안내(유의사항) HTML. 결제 페이지 렌더용. */
    description?: string;
    unitPrice?: number;
    minBookingDuration: number;
    maxBookingDuration?: number | null;
    dailyBookingLimit?: number | null;
    practiceMaxNumber: number;
    imageUrls?: string[];
    date?: string;
    slots?: import("@/app/endpoint/studio.room.endpoint").TimeSlotResponse[];
    myBookings?: { id: number; startDate: string; endDate: string }[];
  };
}

export const GetPayment: Endpoint<GetPaymentRequest, GetPaymentResponse> = {
  method: "get",
  path: `/payment`,
  queryParams: ['itemId', 'item', 'targetUserId', 'date', 'startTime', 'endTime', 'studioId']
};


export type GetPaymentMethodResponse = {
  id: number;
  type: PaymentMethodType;
  name: string;
  providers?: PaymentMethodType[];
  // 키오스크 응답에선 추가로 paymentMethod 래퍼 + isEnabled가 옴 — 일반 결제 흐름에선 미사용
  isEnabled?: boolean;
  paymentMethod?: { id: number; type: PaymentMethodType; name: string };
}

export type PaymentMethodType = 'credit' | 'account_transfer' | 'pass' | 'billing' | 'admin' | 'free' | 'voucher' | 'easy_pay' | 'naver_pay' | 'kakao_pay' | 'toss_pay' | 'foreign_card'

export type PaymentDiscount = {
  key: string;
  amount: number;
  type: 'membership' | 'subscription' | 'passRule';
  itemId: number;
  passRuleId?: number;
  // 키오스크 결제 응답이 요구 — passRule 풀 객체 동봉 (id/targetType/targetLabel/benefitType/benefitValue/excludes)
  passRule?: DiscountPassRule;
}

export type CreateBillingKeyPaymentRequest = {
  billingKey: string;
  item: string;
  itemId: number;
  paymentId: string;
  targetUserId?: number;
  discounts?: PaymentDiscount[];
  /** 연습실 예약 시간대 ('yyyy.MM.dd HH:mm' KST) — practice-room 결제 필수. */
  startDate?: string;
  endDate?: string;
  /**
   * 정기수업 시작 회차 id — item='lesson-group'일 때만 서버가 읽는다(그 외 무시).
   * 결제 화면에 띄운 회차(lesson.id)를 넣으면 그 회차부터 계약 회차 수만큼 잡힌다.
   * 안 보내면 오늘 기준 앞으로 열릴 첫 회차부터. 잘못된 값은 에러 없이 조용히 무시되므로
   * 검증은 발급된 수강권의 첫 회차 날짜로 할 것. 보내면 미납 유예 검사
   * (LESSON_GROUP_DELAYED_TICKET_EXISTS 403)가 새로 켜진다.
   */
  firstLessonId?: number;
}

export type CreateBillingKeyPaymentResponse = {
  success: boolean;
}

export const CreateBillingKeyPayment: Endpoint<CreateBillingKeyPaymentRequest, CreateBillingKeyPaymentResponse> = {
  method: "post",
  path: `/paymentRecords/billingKey`,
  bodyParams: ['billingKey', 'item', 'itemId', 'paymentId', 'targetUserId', 'discounts', 'startDate', 'endDate', 'firstLessonId']
}