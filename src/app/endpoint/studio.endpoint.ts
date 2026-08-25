import { Endpoint } from "@/app/endpoint/index";
import { GetBandLessonResponse, GetBandResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { AnnouncementResponse } from "@/app/endpoint/announcement.endpoint";
import { GetPassResponse, GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";
import { AmenityResponse, RoomDimensions } from "@/app/endpoint/studio.room.endpoint";

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

// GET /studios/:id 의 practiceRooms[] — 커뮤니티 홀 요약 (홀정보 라우트의 축약본)
export type CommunityPracticeRoomResponse = {
  id: number;
  name: string;
  description?: string;
  maxNumber?: number;
  areaSize?: number;
  dimensions?: RoomDimensions;
  floorType?: string;
  amenities?: AmenityResponse[];
  pricePerHour?: number;
  imageUrl?: string;
  /** 오늘(KST) 아직 예약 가능한 시각 목록(정시 hour). 예: [5,7,8]=05·07·08시.
   *  운영시간에서 수업·전체대관·정원소진·이미 시작·minBookingDuration 미만 구간 제외 결과.
   *  수업전용 방에서는 생략됨. */
  availableHours?: number[];
}

export type GetStudioResponse = {
    id: number;
    name: string;
    /** 스튜디오 고유 slug(핸들). 있으면 제목 아래 작게 노출. */
    slug?: string | null;
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
    passes?: GetPassResponse[];
    timeTable?: GetTimeTableResponse;
    banners?: StudioBannerResponse[];
    day: string;
    // 커뮤니티(연습실 전용 스튜디오) 상세용 필드 — BE가 GET /studios/:id 응답에 함께 내려줌
    description?: string | null;
    images?: string[] | null;
    notes?: string[] | null;
    // 건물 시설 토글 목록 [{amenity, label, enabled}] — enabled=false도 포함되니 소비 측에서 필터.
    amenities?: AmenityResponse[];
    passPlans?: GetPassPlanResponse[];
    // 연습실 전용 스튜디오의 방 요약 (홀 스펙/시설). 슬롯은 availability에서.
    practiceRooms?: CommunityPracticeRoomResponse[];
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

export type GetMyStudioResponse = {
  studio: GetStudioResponse;
  /** 최근 7일 이내 최신 공지 1건. 없으면 키째로 없음. */
  announcement?: AnnouncementResponse;
  bands: GetBandResponse[];
  jumbotrons?: GetBandLessonResponse[];
  banners?: HomeBannerResponse[];
}

export type GetTimeTableResponse = {
  days: GetTimeTableDayResponse[];
  cells: GetTimeTableCellResponse[]
  title: string;
  description: string;
  studioId: number;
  baseDate: string;
  /** 시간표 렌더 타입. A=시간축 그리드 / B=구멍 메운 그리드 / C=요일별 리스트. 없으면 A. */
  type?: 'A' | 'B' | 'C';
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
  /** 수업 시작 시각. KST 기준 문자열(yyyy-MM-dd HH:mm 등)로 오며 TZ 변환 없이 리터럴로 파싱한다. */
  startDate?: string;
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

// GET /studio-attendances — 특정 수강생의 출결을 기간(startDate~endDate, 양끝 포함)으로 조회.
export type StudioAttendanceItem = {
  id: number;
  studentId: number;
  studentName: string;
  profileImageUrl?: string | null;
  date: string;                 // 체크인 일자 yyyy-MM-dd (KST)
  checkInTime: string;          // HH:mm (KST)
  checkOutTime?: string | null; // HH:mm | null(미퇴실)
  stayMinutes?: number | null;  // 체류 분 | null
}

export type StudioAttendanceListResponse = {
  attendances: StudioAttendanceItem[];
  summary: { checkInCount: number };
}

export type ListStudioAttendancesParameter = {
  targetUserId: number;
  startDate?: string;  // yyyy-MM-dd (KST, 포함). 미지정 시 오늘
  endDate?: string;    // yyyy-MM-dd (KST, 포함). 미지정 시 startDate와 동일
}

export const ListStudioAttendances: Endpoint<ListStudioAttendancesParameter, StudioAttendanceListResponse> = {
  method: 'get',
  path: '/studio-attendances',
  queryParams: ['targetUserId', 'startDate', 'endDate'],
}
