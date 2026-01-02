import { Endpoint } from "@/app/endpoint/index";
import { GetBandLessonResponse, GetBandResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { GetPassPlanResponse, GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import {GetMembershipResponse} from "@/app/endpoint/membership.endpoint";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";

export type IdParameter = {
  id: number;
};

export type GetStudioListParameter = {
  hasPass?: boolean;
}

export type StudioBannerResponse = {
  id: number;
  studioId: number;
  imageUrl: string;
  endDate: string;
  description?: string;
  route: string;
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
    lessons?: GetBandLessonResponse[];
    announcements?: GetAnnouncementResponse[];
    passPlans?: GetPassPlanResponse[];
    passes?: GetPassResponse[];
    timeTable?: GetTimeTableResponse;
    banners?: StudioBannerResponse[];
    day: string;
};

export type GetMyStudioResponse = {
  studio: GetStudioResponse;
  announcement: GetAnnouncementResponse;
  passes: GetPassResponse[];
  day: string;
  bands: GetBandResponse[];
  myTodayTicket?: TicketResponse;
  membership?: GetMembershipResponse;
}

export type GetTimeTableResponse = {
  days: GetTimeTableDayResponse[];
  cells: GetTimeTableCellResponse[]
  title: string;
  description: string;
  studioId: number;
  baseDate: string;
}

export type GetTimeTableDayResponse = {
  day: string;
  date: string;
  isToday: boolean;
}

export type GetTimeTableParameter = {
  baseDate?: string;
  studioId: number;
}

export type GetTimeTableCellResponse = {
  column: number
  row: number
  length: number
  time: string
  type: 'time' | 'lesson'
  lesson: GetTimeTableLessonResponse
}

export type GetTimeTableLessonResponse = {
  title: string;
  thumbnailUrl: string;
  id: number;
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
