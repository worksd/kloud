import { Endpoint } from "@/app/endpoint/index";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";
import { PaymentType } from "@/app/lessons/[id]/payment/payment.button";

export type GetPaymentRequest = {
  itemId: number
  item: string
  targetUserId?: number
}

export type DiscountResponse = {
  key: string;
  value: string;
  amount: number;
  type: string;
  itemId: number;
  description?: string;
}

export type CouponResponse = {
  id: number;
  name: string;
  discountAmount: number;
  type: string;
}

export type GetPaymentResponse = {
  user: GetUserResponse;
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
  membershipPlan?: GetMembershipPlanResponse;
  paymentId: string;
  refundAccountNumber?: string
  refundAccountBank?: string
  refundDepositor?: string
  discounts?: DiscountResponse[];
  coupons?: CouponResponse[];
}

export const GetPayment: Endpoint<GetPaymentRequest, GetPaymentResponse> = {
  method: "get",
  path: `/payment`,
  queryParams: ['itemId', 'item', 'targetUserId']
};


export type GetPaymentMethodResponse = {
  id: number;
  type: PaymentMethodType;
  name: string;
  providers?: PaymentMethodType[];
}

export type PaymentMethodType = 'credit' | 'account_transfer' | 'pass' | 'billing' | 'admin' | 'free' | 'easy_pay' | 'naver_pay' | 'kakao_pay' | 'toss_pay'

export type CreateBillingKeyPaymentRequest = {
  billingKey: string;
  item: string;
  itemId: number;
  targetUserId?: number;
}

export type CreateBillingKeyPaymentResponse = {
  success: boolean;
}

export const CreateBillingKeyPayment: Endpoint<CreateBillingKeyPaymentRequest, CreateBillingKeyPaymentResponse> = {
  method: "post",
  path: `/paymentRecords/billingKey`,
  bodyParams: ['billingKey', 'item', 'itemId', 'targetUserId']
}