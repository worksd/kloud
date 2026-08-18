import { Endpoint } from "@/app/endpoint/index";
import { BundleSummaryResponse, GetBandResponse, GetBandLessonResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";
import { GetMyStudioResponse, GetStudioResponse } from "@/app/endpoint/studio.endpoint";
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

/** 웹 확장 스튜디오 — 수업 탐색 밴드의 studio·PopularStudios 아이템. slug는 웹 URL 라우팅용. */
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

export type HomeLessonBandType = 'Jumbotrons' | 'TodayLessons' | 'WeeklyLessons' | 'OngoingLessons';

/**
 * GET /home 통합 응답의 밴드 — 배열 순서대로 그리고 type으로 가른다.
 * 수업 탐색 밴드(Jumbotrons~PopularStudios)는 누구나, 사람에 매인 밴드는 로그인 시에만 온다.
 * 모르는 type은 건너뛸 것 (parseHomeBands가 그렇게 한다) — 밴드가 추가돼도 깨지지 않게.
 */
export type HomeBandResponse =
  | { type: 'Alerts'; items: HomeAlertResponse[] }
  | { type: 'MyStudio'; myStudio: GetMyStudioResponse }
  | { type: 'MyStudios'; items: GetStudioResponse[] }
  | { type: 'RecommendedStudios'; items: GetStudioResponse[] }
  | { type: 'Events'; items: GetEventResponse[] }
  | { type: 'Bundles'; items: BundleSummaryResponse[] }
  | { type: 'RoomSlots'; roomSlots?: RoomSlotsSummaryResponse; myBookings?: MyRoomBookingResponse[] }
  | { type: HomeLessonBandType; items: HomeLessonResponse[] }
  | { type: 'PopularStudios'; items: WebStudioResponse[] };

/** 앱·웹 공통 통합 응답 — 이전의 평면 구조(studios/myStudio/... , 웹 전용 jumbotrons/...)는 없어졌다. */
export type GetHomeResponse = {
  bands: HomeBandResponse[];
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