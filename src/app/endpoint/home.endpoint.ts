import { Endpoint } from "@/app/endpoint/index";
import { GetBandResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";
import { GetMyStudioResponse, GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export type GetHomeResponse = {
  studios: GetStudioResponse[];
  myStudio?: GetMyStudioResponse;
  recommendedStudios: GetStudioResponse[];
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