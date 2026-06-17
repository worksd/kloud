import { Endpoint } from "@/app/endpoint/index";
import { BundleSummaryResponse, GetBandResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";
import { GetMyStudioResponse, GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";

export type HomeAlertResponse = {
  title: string;
  description: string;
  route: string;
}

export type GetHomeResponse = {
  studios: GetStudioResponse[];
  myStudio?: GetMyStudioResponse;
  recommendedStudios: GetStudioResponse[];
  events?: GetEventResponse[];
  alerts?: HomeAlertResponse[];
  /** 선택된(또는 첫 번째 가입) 스튜디오의 판매중 묶음. 없으면 []. 레슨 상세의 bundles와 동일 shape. */
  bundles?: BundleSummaryResponse[];
}

export type GetStagResponse = {
  bands: GetBandResponse[];
  studios: GetStudioResponse[];
  jumbotrons: JumbotronResponse[];
}

export type GetHomeRequestParameter = {
  studioId?: string;
}

export const GetHome: Endpoint<GetHomeRequestParameter, GetHomeResponse> = {
  method: 'get',
  queryParams: ['studioId'],
  path: `/home`,
}

export const GetStage: Endpoint<object, GetStagResponse> = {
  method: 'get',
  path: `/home/stage`,
}