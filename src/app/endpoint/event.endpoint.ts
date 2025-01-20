import { Endpoint } from "@/app/endpoint/index";

export type GetEventResponse = {
  id: number;
  route: string;
  hideForeverMessage ?: string;
  imageUrl: string;
  imageRatio: number;
  ctaButtonText: string;
}

export type GetEventListResponse = {
  events: GetEventResponse[];
}

export const GetEventList: Endpoint<object, GetEventListResponse> = {
  method: 'get',
  path: `/events/`,
}