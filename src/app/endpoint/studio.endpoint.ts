import { Endpoint } from "@/app/endpoint/index";
import { GetBandResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { GetPassPlanResponse, GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

export type IdParameter = {
  id: number;
};

export type GetStudioListParameter = {
  hasPass?: boolean;
}

export type GetStudioResponse = {
    id: number;
    name: string;
    address?: string;
    roadAddress?: string;
    profileImageUrl: string;
    coverImageUrl?: string;
    phone?: string;
    youtubeUrl?: string;
    businessName?: string;
    bank?: string;
    accountNumber?: string;
    businessRegistrationNumber?: string;
    eCommerceRegNumber?: string;
    educationOfficeRegNumber?: string;
    representative?: string;
    depositor?: string;
    instagramAddress?: string;
    lessons?: GetLessonResponse[];
    announcements?: GetAnnouncementResponse[];
    passPlans?: GetPassPlanResponse[];
    passes?: GetPassResponse[];
    timeTable?: GetTimeTableResponse;
    day: string;
};

export type GetMyStudioResponse = {
  studio: GetStudioResponse;
  announcement: GetAnnouncementResponse;
  passes: GetPassResponse[];
  timeTable?: GetTimeTableResponse;
  day: string;
  bands: GetBandResponse[];
  myTodayTicket?: TicketResponse;
}

export type GetTimeTableResponse = {
  days: string[];
  cells: GetTimeTableCellResponse[]
  title: string;
  description: string;
  studioId: number;
  nextDate?: string;
  prevDate?: string;
  baseDate?: string;
}

export type GetTimeTableParameter = {
  baseDate: string;
  studioId: number;
}

export type GetTimeTableCellResponse = {
  column: number
  row: number
  length: number
  time: string
  type: 'time' | 'lesson'
  lesson: GetLessonResponse
}

export const GetStudio: Endpoint<IdParameter, GetStudioResponse> = {
  method: "get",
  path: (e) => `/studios/${e.id}`,
};

export type GetStudioListResponse = {
  studios: GetStudioResponse[]
}

export const ListStudios: Endpoint<GetStudioListParameter, GetStudioListResponse> = {
  method: 'get',
  path: `/studios`,
  queryParams: ['hasPass']
}

export const Me: Endpoint<IdParameter, GetMyStudioResponse> = {
  method: 'get',
  path: (e) => `/studios/${e.id}/me`,
  pathParams: ['id'],
}

export const My: Endpoint<object, GetStudioListResponse> = {
  method: 'get',
  path: `/studios/my`,
}

export const TimeTable: Endpoint<GetTimeTableParameter, GetTimeTableResponse> = {
  method: 'get',
  path: (e) => `/studios/${e.studioId}/time-table`,
  pathParams: ['studioId'],
  queryParams: ['baseDate']
}
