import { Endpoint } from "@/app/endpoint/index";
import { BundleSummaryResponse, GetBandResponse, GetBandLessonResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";
import { GetMyStudioResponse, GetStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";

export type HomeAlertResponse = {
  title: string;
  description: string;
  route: string;
}

/** 오늘(KST) 내 연습실 예약(방 무관 flat, 시작시각 오름차순, 취소 제외). RoomSlots 밴드에만 실림. */
export type MyRoomBookingResponse = {
  id: number;
  studioRoomId: number;
  roomName: string;
  startDate: string;
  endDate: string;
}

/** 웹 확장 스튜디오 — 수업 탐색 밴드의 studio 아이템. slug는 웹 URL 라우팅용. */
export type WebStudioResponse = {
  id: number;
  name: string;
  profileImageUrl?: string;
  slug?: string;
  coverImageUrl?: string;
  address?: string;
  roadAddress?: string;
}

/** 수업 탐색 밴드의 수업 카드 — 소비자 수업 카드에 웹용 확장 스튜디오가 항상 실린 형태. */
export type HomeLessonResponse = GetBandLessonResponse & {
  statusLabel?: string;
  dday?: string;
  level?: string;
  limit?: number;
  currentStudentCount?: number;
  price?: number | null;
  genre?: string | null;
  studio?: WebStudioResponse;
}

/** 전체 스튜디오 수업 탐색 밴드(누구나, 비어도 items: [] 로 온다). */
export type HomeLessonBandType = 'Jumbotrons' | 'TodayLessons' | 'WeeklyLessons' | 'OngoingLessons';

/**
 * 선택된 스튜디오의 수업 밴드(로그인, 2026-11-04 부터 최상위 bands[] 로 온다 — 전엔 myStudio.bands[]).
 * 1개 이상일 때만 오고, 배열 순서가 곧 화면 순서다.
 * - MyUpcomingLessons: 내가 신청한 앞으로의 수업(그 스튜디오, 최대 10) — title 문구가 아니라 이 type 으로 가른다
 * - StudioTodayLessons: 그 스튜디오의 오늘 수업(roomName 실림) — 전체 TodayLessons 와 다른 밴드
 * - StudioNewLessons / StudioComingSoonLessons: 방금 공개 / 공개 예정
 * - RecommendedLessons: 들었던 강사·장르 기준 추천
 */
export type StudioLessonBandType =
  | 'MyUpcomingLessons'
  | 'StudioTodayLessons'
  | 'StudioNewLessons'
  | 'StudioComingSoonLessons'
  | 'RecommendedLessons';

export const STUDIO_LESSON_BAND_TYPES: readonly StudioLessonBandType[] = [
  'MyUpcomingLessons', 'StudioTodayLessons', 'StudioNewLessons', 'StudioComingSoonLessons', 'RecommendedLessons',
];

/** 선택된 스튜디오 수업 밴드 — title 은 X-Guinness-Locale 로 번역돼 오고, items 는 스튜디오 상세 lessons[] 와 같은 카드 모양. */
export type StudioLessonBandResponse = {
  type: StudioLessonBandType;
  title: string;
  items: GetBandLessonResponse[];
}

/** 홈 MyStudio 밴드의 myStudio — 스튜디오 상세(GET /studios/me)와 달리 bands 가 없다(최상위 밴드로 빠짐). */
export type HomeMyStudioResponse = Omit<GetMyStudioResponse, 'bands'>;

/**
 * GET /home 통합 응답의 밴드 — 배열 순서대로 그리고 type으로 가른다.
 * 수업 탐색 밴드(Jumbotrons~OngoingLessons)는 누구나, 사람에 매인 밴드는 로그인 시에만 온다.
 * 모르는 type은 건너뛸 것 (parseHomeBands가 그렇게 한다) — 밴드가 추가돼도 깨지지 않게.
 * PopularStudios 는 2026-11-04 에 없어졌다.
 */
export type HomeBandResponse =
  | { type: 'Alerts'; items: HomeAlertResponse[] }
  | { type: 'MyStudio'; myStudio: HomeMyStudioResponse }
  | StudioLessonBandResponse
  | { type: 'MyStudios'; items: GetStudioResponse[] }
  | { type: 'RecommendedStudios'; items: GetStudioResponse[] }
  | { type: 'Events'; items: GetEventResponse[] }
  | { type: 'Bundles'; items: BundleSummaryResponse[] }
  /** 선택된 스튜디오의 판매중 정규반 전부(페이지 없음, 서버 정렬). 없으면 밴드 자체가 빠진다. 가격은 상세 passPlans 에서. */
  | { type: 'RegularClasses'; items: StudioRegularClassResponse[] }
  | { type: 'RoomSlots'; roomSlots?: RoomSlotsSummaryResponse; myBookings?: MyRoomBookingResponse[] }
  | { type: HomeLessonBandType; items: HomeLessonResponse[] };

/**
 * 홈 미납 결제건(BE 1990cda0) — 돈은 안 냈지만 스튜디오 설정(unpaidEnabled)으로 수강은 이어지는 정규반 결제건.
 * 로그인 시에만 키가 오고, 미납 유예 패스 한 장당 한 건, 종료일 이른 순. 홈 미납 다이얼로그는 첫 건을 쓴다.
 * amount 는 가격정책 가격, route 는 눌렀을 때 갈 결제 페이지('/payment?item=pass-plan&id=&paymentId=', 서버가 정한다 — FE 가 조립하지 않는다).
 * 그 외 필드명은 결제 내역(GetPaymentRecordResponse)에 맞춰 둔 것 — 없으면 다이얼로그가 스튜디오 이름 등으로 폴백한다.
 */
export type HomeUnpaidPaymentRecordResponse = {
  id: number;
  paymentId?: string | null;
  /** 상품명(정규반 이름) */
  productName?: string | null;
  productImageUrl?: string | null;
  /** 상품 부가 설명(예: 플랜명 · 기간) */
  productDescription?: string | null;
  amount: number;
  /** 결제 페이지 경로 */
  route: string;
  studio?: WebStudioResponse | null;
}

/** 앱·웹 공통 통합 응답 — 이전의 평면 구조(studios/myStudio/... , 웹 전용 jumbotrons/...)는 없어졌다. */
export type GetHomeResponse = {
  bands: HomeBandResponse[];
  /** 미납 결제건(정규반, 로그인 시). 없으면 빈 배열 또는 미포함 — 홈 맨 위 미납 카드 */
  unpaidPaymentRecords?: HomeUnpaidPaymentRecordResponse[] | null;
  /** 홈 플로팅 버튼 문구(예: '수강 등록하기') — 학원 판매 상품에 맞춰 BE가 정한다. 없거나 빈 값이면 버튼을 숨긴다 */
  ctaText?: string | null;
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