import { Endpoint } from "@/app/endpoint/index";

export type GetPassRequest = {
  studioId: number
}

export type GetPassListResponse = {
  passes: GetPassResponse[]
}

export type GetPassResponse = {
  id: number
  price: number
  title: string
  isHot: boolean
}


export const GetPasses: Endpoint<GetPassRequest, GetPassListResponse> = {
  method: "get",
  path: (e) => `/passes`,
};
