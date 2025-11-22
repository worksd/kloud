import {Endpoint} from "@/app/endpoint/index";
import {GetEventListResponse} from "@/app/endpoint/event.endpoint";

export type DynamicRequestParameter = {
  path: string;
}

export const DynamicGET: Endpoint<DynamicRequestParameter, any> = {
  method: 'get',
  path: (e) => (e.path),
}