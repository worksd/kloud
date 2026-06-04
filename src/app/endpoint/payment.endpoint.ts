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

export type GetPaymentResponse = {
  user: GetUserResponse;
  /**
   * 회원이 보유한 패스권 목록 — 결제수단/할인이 아닌 별도 섹션으로 노출.
   * 과거에는 user.passes로 내려왔지만 user와 같은 레벨로 분리됨.
   */
  passes?: GetPassResponse[];
  /** 결제 페이지 진입 직후 강제 이동시킬 라우트. BE가 지정하면 결제 폼 대신 navigateMain. */
  redirectUrl?: string;
  price?: number;
  methods: GetPaymentMethodResponse[];
  cards?: GetBillingResponse[];
  lesson?: GetLessonResponse;
  lessonGroup?: {
    id: number;
    title: string;
    price: number;
    description?: string;
    studioImageUrl?: string;
    studioName?: string;
    thumbnailUrl?: string;
    type?: string;
    studio?: { id: number; name: string };
  };
  passPlan?: GetPassPlanResponse;
  /** 번들(묶음) 결제 — methods에는 Pass/Billing 자동 제외돼 있음 */
  bundle?: {
    bundleId: number;
    name: string;
    description?: string;
    /** 구성 lesson 합계가(할인 전). UI에서 strike-through 가격 표시에 사용. */
    originalPrice?: number;
    /** 번들 판매 종료 시각 (KST). 'yyyy.MM.dd HH:mm' 또는 ISO */
    closeDate?: string;
    /** 구성 수업 목록 */
    items: {
      itemType: string;     // 'lesson' 등
      itemId: number;
      title: string;
      price: number;
      startDate?: string;
      thumbnailUrl?: string;
    }[];
    studio?: { id: number; name: string; profileImageUrl?: string };
  };
  paymentId: string;
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  discounts?: DiscountResponse[];
  coupons?: CouponResponse[];
  studioRoom?: {
    id: number;
    name: string;
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
  queryParams: ['itemId', 'item', 'targetUserId', 'date']
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
}

export type CreateBillingKeyPaymentResponse = {
  success: boolean;
}

export const CreateBillingKeyPayment: Endpoint<CreateBillingKeyPaymentRequest, CreateBillingKeyPaymentResponse> = {
  method: "post",
  path: `/paymentRecords/billingKey`,
  bodyParams: ['billingKey', 'item', 'itemId', 'paymentId', 'targetUserId', 'discounts']
}