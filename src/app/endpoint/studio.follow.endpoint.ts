import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { IdParameter } from "@/app/endpoint/studio.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

export type StudioFollowRequest = {
  studioId: number;
}

export type StudioFollowResponse = {
  id: number;
}

export const Follow: Endpoint<StudioFollowRequest, StudioFollowResponse> = {
  method: 'post',
  path: `/studioFollow`,
  bodyParams: ['studioId']
}

export const UnFollow: Endpoint<IdParameter, SimpleResponse> = {
  method: 'delete',
  path: (e) => `/studioFollow/${e.id}`,
  pathParams: ['id']
}
