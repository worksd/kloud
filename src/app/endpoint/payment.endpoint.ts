import { Endpoint } from "@/app/endpoint/index";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export type GetPaymentRequest = {
  itemId: number
  item: 'lesson' | 'pass-plan'
}

export type GetPaymentResponse = {
  user: GetUserResponse;
  totalPrice: number;
  methods: string[];
  lesson?: GetLessonResponse;
  passPlan?: GetPassPlanResponse;
}

export const GetPayment: Endpoint<GetPaymentRequest, GetPaymentResponse> = {
  method: "get",
  path: `/payment`,
  queryParams: ['itemId', 'item']
};