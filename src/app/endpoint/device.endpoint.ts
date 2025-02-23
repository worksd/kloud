import { Endpoint, SimpleResponse } from "@/app/endpoint/index";
import { GetEventListResponse } from "@/app/endpoint/event.endpoint";

export type RegisterDeviceParameter = {
  token: string,
  udid: string,
}

export type UnregisterDeviceParameter = {
  udid: string,
}

export const RegisterDevice: Endpoint<RegisterDeviceParameter, SimpleResponse> = {
  method: 'post',
  path: `/devices`,
  bodyParams: ['token', 'udid']
}

export const UnregisterDevice: Endpoint<UnregisterDeviceParameter, SimpleResponse> = {
  method: 'delete',
  path: (e) => `/devices/${e.udid}`,
  pathParams: ['udid']
}