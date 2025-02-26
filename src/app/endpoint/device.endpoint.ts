import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { GetEventListResponse } from "@/app/endpoint/event.endpoint";

export type RegisterDeviceParameter = {
  token: string,
  udid: string,
}

export const RegisterDevice: Endpoint<RegisterDeviceParameter, SimpleResponse> = {
  method: 'post',
  path: `/devices`,
  bodyParams: ['token', 'udid']
}

export const UnregisterDevice: Endpoint<object, SimpleResponse> = {
  method: 'delete',
  path: '/devices',
}