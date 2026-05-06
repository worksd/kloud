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
    /** BE가 youtubeUrl로부터 resolve해 저장한 채널 키. playlistId = `UU` + youtubeChannelKey 로 영상 호출에 사용. null이면 영상 영역 미노출. */
    youtubeChannelKey?: string | null;
    businessName?: string;
    bank?: string;
    accountNumber?: string;
    businessRegistrationNumber?: string;
    eCommerceRegNumber?: string;
    educationOfficeRegNumber?: string;
    representative?: string;
    depositor?: string;
    instagramAddress?: string;
    kioskImageUrl?: string;
    /** 영수증 하단에 추가로 인쇄할 안내 문구 (스튜디오별 설정, 줄바꿈 가능) */
    receiptFooter?: string;
    lessons?: GetBandLessonResponse[];
    announcements?: GetAnnouncementResponse[];
    passPlans?: GetPassPlanResponse[];
    passes?: GetPassResponse[];
    timeTable?: GetTimeTableResponse;
    banners?: StudioBannerResponse[];
    lessonGroups?: LessonGroupSummary[];
    day: string;
};

export type YoutubeContentResponse = {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
};

export type HomeBannerResponse = {
  id: number;
  imageUrl: string;
  description: string;
  route: string;
}

export type LessonGroupSummary = {
  id: number;
  title: string;
  description: string;
  label: { genre: string; type: string; isEnded: boolean };
  studioImageUrl: string;
  studioName: string;
  thumbnailUrl: string;
  type: string;
}

export type GetMyStudioResponse = {
  studio: GetStudioResponse;
  announcement: GetAnnouncementResponse;
  bands: GetBandResponse[];
  lessonGroups?: LessonGroupSummary[];
  jumbotrons?: GetBandLessonResponse[];
  banners?: HomeBannerResponse[];
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
  time?: string
  lesson?: GetTimeTableLessonResponse
}

export type GetTimeTableLessonResponse = {
  id: number;
  title: string;
  thumbnailUrl?: string;
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

export enum StudioAttendanceStatus {
  CheckIn = 'CheckIn',
  CheckOut = 'CheckOut',
  Cancelled = 'Cancelled',
}

export type AttendanceStatus = 'CheckIn' | 'CheckOut';

export type CreateStudioAttendanceRequest = {
  targetUserId: number;
  status: AttendanceStatus;
}

export type StudioAttendanceResponse = {
  id: number;
  targetUserId: number;
  status: AttendanceStatus;
  createdAt: string;
}

export const CreateStudioAttendance: Endpoint<CreateStudioAttendanceRequest, StudioAttendanceResponse> = {
  method: 'post',
  path: '/studio-attendances',
  bodyParams: ['targetUserId', 'status']
}
