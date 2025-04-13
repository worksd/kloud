import { Endpoint } from "@/app/endpoint/index";
import { GetBandResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { GetPassPlanResponse, GetPassResponse } from "@/app/endpoint/pass.endpoint";

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
    follow?: StudioFollowResponse;
    announcements?: GetAnnouncementResponse[];
    passPlans?: GetPassPlanResponse[];
    passes?: GetPassResponse[];
};

export type GetMyStudioResponse = {
  studio: GetStudioResponse;
  announcement: GetAnnouncementResponse;
  passes: GetPassResponse[];
  schedules?: GetLessonResponse[];
  day: number;
  bands: GetBandResponse[];
}

export type StudioFollowResponse = {
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
