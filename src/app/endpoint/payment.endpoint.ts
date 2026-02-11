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
}

export type GetPaymentResponse = {
  user: GetUserResponse;
  totalPrice: number;
  originalPrice: number;
  methods: GetPaymentMethodResponse[];
  cards?: GetBillingResponse[];
  lesson?: GetLessonResponse;
  lessonGroup?: {
    id: number;
    title: string;
    description?: string;
    studioImageUrl?: string;
    studioName?: string;
    thumbnailUrl?: string;
    type?: string;
  };
  passPlan?: GetPassPlanResponse;
  membershipPlan?: GetMembershipPlanResponse;
  paymentId: string;
  refundAccountNumber?: string
  refundAccountBank?: string
  refundAccountDepositor?: string
  discounts?: DiscountResponse[];
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
}

export type PaymentMethodType = 'credit' | 'account_transfer' | 'pass' | 'billing' | 'admin'

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
  path: `/payment/billingKey`,
  bodyParams: ['billingKey', 'item', 'itemId', 'targetUserId']
}