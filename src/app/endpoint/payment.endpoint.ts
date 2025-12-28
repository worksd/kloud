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

export type GetPaymentResponse = {
  user: GetUserResponse;
  totalPrice: number;
  methods: GetPaymentMethodResponse[];
  cards?: GetBillingResponse[];
  lesson?: GetLessonResponse;
  passPlan?: GetPassPlanResponse;
  membershipPlan?: GetMembershipPlanResponse;
  paymentId: string;
  refundAccountNumber?: string
  refundAccountBank?: string
  refundAccountDepositor?: string
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