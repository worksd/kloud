import { Endpoint } from "@/app/endpoint/index";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";

export type GetPaymentRequest = {
  itemId: number
  item: PaymentItemType
}

export type PaymentItemType = 'lesson' | 'pass-plan'

export type GetPaymentResponse = {
  user: GetUserResponse;
  totalPrice: number;
  methods: GetPaymentMethodResponse[];
  cards?: GetBillingResponse[];
  lesson?: GetLessonResponse;
  passPlan?: GetPassPlanResponse;
  paymentId: string;
}

export const GetPayment: Endpoint<GetPaymentRequest, GetPaymentResponse> = {
  method: "get",
  path: `/payment`,
  queryParams: ['itemId', 'item']
};


export type GetPaymentMethodResponse = {
  id: number;
  type: PaymentMethodType;
  name: string;
}

export type PaymentMethodType = 'credit' | 'account_transfer' | 'pass' | 'billing'