import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetMembershipPlansRequest = {
  studioId?: number;
}

export type GetMembershipPlanResponse = {
  id: number;
  name: string;
  price: number;
  studio?: GetStudioResponse;
  description?: string;
  durationMonths?: number;
  benefits?: string[];
  imageUrl?: string;
  discountAmount?: number;
  deductedSettleAmount?: number;
  canUsePracticeRoom?: boolean;
  duration?: number;
  status?: string;
}

export type GetMembershipPlansResponse = {
  membershipPlans: GetMembershipPlanResponse[];
}

export type GetMembershipResponse = {
  id: number;
  userId: number;
  plan: GetMembershipPlanResponse;
  endDate: string;
  status: string;
}

export const GetMembershipPlans: Endpoint<GetMembershipPlansRequest, GetMembershipPlansResponse> = {
  method: "get",
  path: `/membershipPlans`,
  queryParams: ['studioId']
};

export type GetMembershipRequest = {
  id: number;
}

export const GetMembership: Endpoint<GetMembershipRequest, GetMembershipResponse> = {
  method: "get",
  path: (e) => `/memberships/${e.id}`,
  pathParams: ['id']
};

