import { Endpoint } from "@/app/endpoint/index";
import { GetBandResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetMyStudioResponse, GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";

export type GetHomeResponse = {
  studios: GetStudioResponse[];
  myStudio?: GetMyStudioResponse;
  events: GetEventResponse[];
  recommendedStudios: GetStudioResponse[];
}

export type GetStagResponse = {
  bands: GetBandResponse[];
  studios: GetStudioResponse[];
  jumbotrons: GetLessonResponse[];
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