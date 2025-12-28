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
}

export type GetMembershipPlansResponse = {
  membershipPlans: GetMembershipPlanResponse[];
}

export const GetMembershipPlans: Endpoint<GetMembershipPlansRequest, GetMembershipPlansResponse> = {
  method: "get",
  path: `/membershipPlans`,
  queryParams: ['studioId']
};

