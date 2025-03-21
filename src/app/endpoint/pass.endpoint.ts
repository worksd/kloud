import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetPassPlanListRequest = {
  studioId: number
}

export type GetPassRequest = {
  id: number
}

export type GetPassListRequest = {
  order: PassOrder
}

export type GetPassPlanResponse = {
  id: number
  name: string
  price?: number
  studio?: GetStudioResponse
  isPopular: boolean
}

export type GetPassPlansResponse = {
  passPlans: GetPassPlanResponse[]
}

export type GetPassResponse = {
  id: number
  price: number
  status?: PassStatus,
  title: string
  plan?: GetPassPlanResponse
}

export type GetPassesResponse = {
  passes: GetPassResponse[]
}

export type PassOrder = 'upcoming' | 'newest'
export type PassStatus = 'Active' | 'Done' | 'Expired'


export const GetPassPlans: Endpoint<GetPassPlanListRequest, GetPassPlansResponse> = {
  method: "get",
  path: `/passPlans`,
  queryParams: ['studioId']
};

export const GetPasses: Endpoint<GetPassListRequest, GetPassesResponse> = {
  method: 'get',
  path: '/passes'
}

export const GetPass: Endpoint<GetPassRequest, GetPassResponse> = {
  method: 'get',
  path: (e) => `/passes/${e.id}`,
}
