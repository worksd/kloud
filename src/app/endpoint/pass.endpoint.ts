import { Endpoint } from "@/app/endpoint/index";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";


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
  isPopular: boolean,
  usageLimit?: number
}

export type GetPassPlansResponse = {
  passPlans: GetPassPlanResponse[]
}

export type GetPassResponse = {
  id: number
  price: number
  endDate: string,
  status?: PassStatus,
  title: string
  passPlan?: GetPassPlanResponse
  tickets?: TicketResponse[]
}

export type GetPassesResponse = {
  passes: GetPassResponse[]
}

export type CreatePassRequest = {
  passPlanId: number
  paymentId: string
  status: PassStatus,
  depositor?: string,
}

export type PassOrder = 'upcoming' | 'newest'
export type PassStatus = 'Active' | 'Done' | 'Expired' | 'Pending'


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

export const CreatePass: Endpoint<CreatePassRequest, GetPassResponse> = {
  method: 'post',
  path: `/passes`,
  bodyParams: ['passPlanId', 'paymentId', 'depositor', 'status']
}
