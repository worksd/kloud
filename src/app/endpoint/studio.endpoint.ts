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

/** GET /studios/:id 의 regularClasses[].artist — 파트너 정규반 목록(GET /regular-classes)과 같은 모양 */
export type StudioRegularClassArtistResponse = {
  id: number;
  /** 본명. 안 적혀 있으면 null이 아니라 빈 문자열 → 표시 이름은 `nickName || name` 으로 고른다 */
  name: string;
  nickName?: string | null;
  profileImageUrl?: string | null;
}

/** GET /studios/:id 의 regularClasses[] — 판매중 정규반 노출 차례 상위 4건. 탭하면 pass-plans?regularClassId= 로 */
export type StudioRegularClassResponse = {
  id: number;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  tag?: string | null;
  /** 담당 강사. 안 정했거나 삭제됐으면 null — 카드는 그대로 두고 강사 줄만 숨김/미정 처리 */
  artist?: StudioRegularClassArtistResponse | null;
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
    // 판매중 정규반 상위 4건 (강사 포함). 없으면 키째로 없거나 빈 배열
    regularClasses?: StudioRegularClassResponse[];
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

/**
 * GET /regular-classes?studioId= — 스튜디오 판매중 정규반 전체 목록 (상세의 regularClasses 는 상위 4건만).
 * 항목 모양은 GET /studios/:id regularClasses[] 와 동일(artist 포함). 응답 래퍼 키·페이지 파라미터는 BE 확정 대기.
 */
export type ListRegularClassesParameter = {
  studioId: number;
  page?: number;
}

export type ListRegularClassesResponse = {
  regularClasses: StudioRegularClassResponse[];
  totalPage?: number | null;
}

export const ListRegularClasses: Endpoint<ListRegularClassesParameter, ListRegularClassesResponse> = {
  method: 'get',
  path: '/regular-classes',
  queryParams: ['studioId', 'page'],
}

/**
 * GET /regular-classes/:id — 정규반 상세. 앱 결제는 여기 passPlans[] 중 하나(가격정책)를 item=pass-plan 으로 산다
 * (정규반 등록 결제 연동 가이드 2026-09-21). passPlans[].status 가 'Pending' 이면 판매중단 — 어느 경로로도 못 사니 선택지에서 뺀다.
 */
export type RegularClassDetailResponse = StudioRegularClassResponse & {
  passPlans?: GetPassPlanResponse[];
  /** 미납 유예 허용 여부 — 앱에선 표시만 */
  unpaidEnabled?: boolean;
}

export const GetRegularClass: Endpoint<IdParameter, RegularClassDetailResponse> = {
  method: 'get',
  path: (e) => `/regular-classes/${e.id}`,
}

export const GetStudio: Endpoint<IdParameter, GetStudioResponse> = {
  method: "get",
  path: (e) => `/studios/${e.id}`,
};

/** /@{slug} 조회 — 응답이 { studio } 로 감싸 오거나 바로 올 수 있어 호출부에서 펴서 쓴다 (proxy.ts와 동일 처리). */
export type GetStudioBySlugResponse = GetStudioResponse | { studio: GetStudioResponse };

export const GetStudioBySlug: Endpoint<{ slug: string }, GetStudioBySlugResponse> = {
  method: "get",
  path: (e) => `/studios/by-slug/${encodeURIComponent(e.slug)}`,
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

// ─── 내 스튜디오 설정 (스튜디오 설정 수정 가이드 2026-09-28) ─────────────────────────
// PATCH /studios 와 GET /studios/me/* 는 x-guinness-client: PARTNER 가 아니면 STUDIO_PARTNER_NOT_MATCH(401).
// kloud 프록시는 OS 이름/Web/KIOSK 만 세팅하므로 이 엔드포인트들만 헤더를 덮어쓴다.
const PARTNER_HEADERS = { 'x-guinness-client': 'PARTNER' } as const;

export type TicketAutoUse = 'None' | 'SameDayOnSite';
export type StudioAmenity = 'Parking' | 'Wifi' | 'AirConditioner' | 'FittingRoom' | 'WaterDispenser' | 'Elevator' | 'Tripod' | 'Restroom';

export type StudioPaymentMethodResponse = {
  id: number;
  isEnabled: boolean;
  /** 결제수단 상세 — 표시명 키가 BE 확정 전이라 여러 후보를 받는다 */
  paymentMethod?: { id?: number; name?: string; label?: string; title?: string; type?: string; methodType?: string } & Record<string, unknown>;
}

/**
 * PATCH /studios 요청. 담은 키만 바뀐다.
 * - 일반 필드는 null 로 지울 수 없다(무시됨). 문자열은 '' 로 비운다.
 * - daysBeforeOpen↔lessonOpenTime, daysBeforeSale↔lessonSaleTime 은 짝으로(둘 다 생략/둘 다 null/둘 다 값).
 * - studioPaymentMethodIds 는 부분 수정이 아니라 전체 덮어쓰기 — 건드리지 않을 땐 키를 빼야 한다.
 * - amenities 는 보낸 항목만 upsert.
 */
export type UpdateStudioRequest = {
  name?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  address?: string;
  roadAddress?: string;
  instagramAddress?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  slug?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  representative?: string;
  taxType?: string;
  businessRegistrationCopyUrl?: string;
  eCommerceRegNumber?: string;
  educationOfficeRegNumber?: string;
  bank?: string;
  bankCode?: string;
  accountNumber?: string;
  depositor?: string;
  payoutBank?: string;
  payoutBankCode?: string;
  payoutAccountNumber?: string;
  payoutDepositor?: string;
  daysBeforeOpen?: number | null;
  lessonOpenTime?: string | null;
  daysBeforeSale?: number | null;
  lessonSaleTime?: string | null;
  lessonCloseTime?: string | null;
  hoursAfterAutoCancelAccountTransfer?: number;
  ticketAutoUse?: TicketAutoUse;
  lessonPostponeLimit?: number;
  lessonUnpaidEnabled?: boolean;
  timeTableType?: string;
  studioPaymentMethodIds?: number[];
  roomRefundDays?: number;
  roomUsageInfo?: string;
  roomCaution?: string;
  roomNoticeHours?: number;
  kioskImageUrl?: string;
  representativeBillingKey?: string;
  amenities?: { amenity: StudioAmenity; enabled: boolean }[];
}

/** PATCH /studios 응답(BusinessStudioResponse). GET /studios/me/* 도 이 부분집합으로 온다고 보고 전부 optional. */
export type BusinessStudioResponse = {
  id: number;
  name?: string;
  slug?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  roadAddress?: string | null;
  naverPlaceId?: string | null;
  instagramAddress?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  xUrl?: string | null;
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  representative?: string | null;
  taxType?: string | null;
  businessRegistrationCopyUrl?: string | null;
  eCommerceRegNumber?: string | null;
  educationOfficeRegNumber?: string | null;
  bank?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  depositor?: string | null;
  payoutBank?: string | null;
  payoutBankCode?: string | null;
  payoutAccountNumber?: string | null;
  payoutDepositor?: string | null;
  isBankAccountVerified?: boolean;
  daysBeforeOpen?: number | null;
  lessonOpenTime?: string | null;
  daysBeforeSale?: number | null;
  lessonSaleTime?: string | null;
  lessonCloseTime?: string | null;
  hoursAfterAutoCancelAccountTransfer?: number | null;
  ticketAutoUse?: TicketAutoUse | null;
  lessonPostponeLimit?: number | null;
  lessonUnpaidEnabled?: boolean | null;
  timeTableType?: string | null;
  roomRefundDays?: number | null;
  roomUsageInfo?: string | null;
  roomCaution?: string | null;
  roomNoticeHours?: number | null;
  kioskImageUrl?: string | null;
  isPracticeOnly?: boolean;
  /** studioPaymentMethodIds 를 보낸 PATCH 응답과 GET /studios/me/lesson-settings 에만 */
  studioPaymentMethods?: StudioPaymentMethodResponse[];
  amenities?: AmenityResponse[];
}

/** 응답이 { studio } 로 감싸 올 수도 있어 호출부에서 편다 */
export type MyStudioSettingsResponse = BusinessStudioResponse | { studio: BusinessStudioResponse };

export const GetMyStudioProfile: Endpoint<object, MyStudioSettingsResponse> = {
  method: 'get',
  path: '/studios/me/profile',
  headers: PARTNER_HEADERS,
}

export const GetMyStudioBusiness: Endpoint<object, MyStudioSettingsResponse> = {
  method: 'get',
  path: '/studios/me/business',
  headers: PARTNER_HEADERS,
}

export const GetMyStudioLessonSettings: Endpoint<object, MyStudioSettingsResponse> = {
  method: 'get',
  path: '/studios/me/lesson-settings',
  headers: PARTNER_HEADERS,
}

export const GetMyStudioRoomSettings: Endpoint<object, MyStudioSettingsResponse> = {
  method: 'get',
  path: '/studios/me/room-settings',
  headers: PARTNER_HEADERS,
}

// ─── 이용권(요금제) — 설정>결제 연동 가이드 2026-10-04 ──────────────────────────────
/** 이 API 가 실제로 주는 status 는 Active · Ended 둘뿐 (Scheduled/Cancelled/레거시는 안 온다) */
export type StudioSubscriptionStatus = 'Active' | 'Ended' | 'Scheduled' | 'Cancelled' | 'Trial' | 'Unpaid' | 'None';
/** 플랜 이름. Lite=Basic=EarlyBirdBasic(1) < Premium(2) < Enterprise(3). 모르는 값은 planDisplayName 을 우선 쓴다 */
export type StudioPlanType = 'Lite' | 'Basic' | 'EarlyBirdBasic' | 'Premium' | 'Enterprise' | 'PracticeRoom' | 'None';
export type StudioBillingCycle = 'MONTHLY' | 'ANNUAL';

export type StudioScheduledPlan = {
  /** yyyy-MM-dd | null — 다음 구독 시작일 */
  date: string | null;
  type: StudioPlanType;
  planDisplayName: string | null;
  billingCycle: StudioBillingCycle | null;
};

export type StudioSubscription = {
  id: number;
  status: StudioSubscriptionStatus;
  type: StudioPlanType;
  planDisplayName: string | null;
  /** 체험 중(isTrial)에는 null */
  billingCycle: StudioBillingCycle | null;
  studioPlanId: number;
  /** yyyy-MM-dd(KST 달력일) | null */
  startDate: string | null;
  /** yyyy-MM-dd | null — 이용 마지막 날(포함) */
  endDate: string | null;
  isTrial: boolean;
  /** yyyy-MM-dd | null. Ended 면 null. 예약 행이 있으면 '예약 구간 끝+1' 이라 실제 다음 결제일(다음 달 1일)과 다를 수 있다 */
  nextPaymentDate: string | null;
  /** Active 면 항상 있다(변경 없으면 현재 플랜 그대로). 변경 예약 판정은 존재 여부가 아니라 type/billingCycle/date 비교로 */
  scheduledPlan: StudioScheduledPlan | null;
  /** 미결제 항목 합계. 아직 결제일이 안 된 이번 달 항목까지 합산되므로 '진짜 미납' 판정엔 쓰지 않는다 */
  failedPayment: { amount: number; billingMonth: string | null } | null;
};

export type StudioSubscriptionResponse = {
  id: number;
  name: string;
  representativeBillingKey: string | null;
  /** null: 가입 전 / 해지 후 endDate 경과 / 연속 미납 정지 */
  subscription: StudioSubscription | null;
};

export const GetMyStudioSubscription: Endpoint<object, StudioSubscriptionResponse> = {
  method: 'get',
  path: '/studios/me/subscription',
  headers: PARTNER_HEADERS,
}

export const UpdateStudio: Endpoint<UpdateStudioRequest, BusinessStudioResponse> = {
  method: 'patch',
  path: '/studios',
  headers: PARTNER_HEADERS,
  bodyParams: [
    'name', 'profileImageUrl', 'coverImageUrl', 'phone', 'address', 'roadAddress',
    'instagramAddress', 'youtubeUrl', 'tiktokUrl', 'xUrl', 'slug',
    'businessName', 'businessRegistrationNumber', 'representative', 'taxType', 'businessRegistrationCopyUrl',
    'eCommerceRegNumber', 'educationOfficeRegNumber',
    'bank', 'bankCode', 'accountNumber', 'depositor',
    'payoutBank', 'payoutBankCode', 'payoutAccountNumber', 'payoutDepositor',
    'daysBeforeOpen', 'lessonOpenTime', 'daysBeforeSale', 'lessonSaleTime', 'lessonCloseTime',
    'hoursAfterAutoCancelAccountTransfer', 'ticketAutoUse', 'lessonPostponeLimit', 'lessonUnpaidEnabled',
    'timeTableType', 'studioPaymentMethodIds',
    'roomRefundDays', 'roomUsageInfo', 'roomCaution', 'roomNoticeHours',
    'kioskImageUrl', 'representativeBillingKey', 'amenities',
  ],
}
