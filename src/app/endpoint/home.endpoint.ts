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
  /** 선택된 스튜디오의 판매중 정규반 전부(페이지 없음, 서버 정렬). 없으면 밴드 자체가 빠진다. 가격은 상세 passPlans 에서. */
  | { type: 'RegularClasses'; items: StudioRegularClassResponse[] }
  | { type: 'RoomSlots'; roomSlots?: RoomSlotsSummaryResponse; myBookings?: MyRoomBookingResponse[] }
  | { type: HomeLessonBandType; items: HomeLessonResponse[] }
  | { type: 'PopularStudios'; items: WebStudioResponse[] };

/**
 * 홈 미납 결제건 — 돈은 안 냈지만 스튜디오 설정(unpaidEnabled)으로 수강은 이어지는 정규반 결제건. 로그인 시에만, 정규반만 온다.
 * route 는 눌렀을 때 갈 결제 페이지(서버가 정한다 — FE 가 item/id 를 조립하지 않는다).
 * 필드명은 결제 내역(GetPaymentRecordResponse)에 맞춰 둔 것 — 실제 응답과 다르면 여기만 고친다.
 */
export type HomeUnpaidPaymentRecordResponse = {
  id: number;
  paymentId?: string | null;
  /** 상품명(정규반 이름) */
  productName: string;
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