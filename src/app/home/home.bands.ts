// GET /home 통합 응답({bands})을 화면이 쓰기 좋은 평면 구조로 푼다.
// 밴드 순서 의존 대신 type으로 가르고, 모르는 type은 건너뛴다 — 밴드가 추가돼도 깨지지 않게.

import {
  GetHomeResponse,
  HomeAlertResponse,
  HomeLessonResponse,
  HomeMyStudioResponse,
  HomeUnpaidPaymentRecordResponse,
  MyRoomBookingResponse,
  STUDIO_LESSON_BAND_TYPES,
  StudioLessonBandResponse,
  StudioLessonBandType,
} from "@/app/endpoint/home.endpoint";
import { GetStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";
import { BandLabel, BandType, BundleSummaryResponse, GetBandResponse } from "@/app/endpoint/lesson.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";

export type ParsedHome = {
  // 사람에 매인 밴드 (로그인 시에만 채워진다)
  alerts: HomeAlertResponse[];
  /** 미납 결제건(정규반) — 밴드가 아니라 응답 루트 필드 */
  unpaidPaymentRecords: HomeUnpaidPaymentRecordResponse[];
  myStudio?: HomeMyStudioResponse;
  /**
   * 선택된 스튜디오의 수업 밴드(MyUpcomingLessons…RecommendedLessons) — 응답 순서 그대로.
   * 화면은 기존 밴드 모양(GetBandResponse)을 그대로 쓰므로 여기서 바꿔 둔다(toLessonBand). homeType 으로 원래 type 을 알 수 있다.
   */
  studioLessonBands: HomeStudioLessonBand[];
  myStudios: GetStudioResponse[];
  recommendedStudios: GetStudioResponse[];
  events: GetEventResponse[];
  bundles: BundleSummaryResponse[];
  regularClasses: StudioRegularClassResponse[];
  roomSlots?: RoomSlotsSummaryResponse;
  myBookings?: MyRoomBookingResponse[];
  // 수업 탐색 밴드 (누구나)
  jumbotrons: HomeLessonResponse[];
  todayLessons: HomeLessonResponse[];
  weeklyLessons: HomeLessonResponse[];
  ongoingLessons: HomeLessonResponse[];
}

export type HomeStudioLessonBand = GetBandResponse & { homeType: StudioLessonBandType };

/** 홈 수업 밴드 type → 기존 화면 밴드 종류·라벨. Today 는 시간표형, Recommendation 은 추천 포스터, 나머진 기본 포스터. */
const BAND_VIEW: Record<StudioLessonBandType, { type: BandType; label?: BandLabel }> = {
  MyUpcomingLessons: { type: 'Default' },
  StudioTodayLessons: { type: 'Today' },
  StudioNewLessons: { type: 'Default', label: { new: true } },
  StudioComingSoonLessons: { type: 'Default', label: { coming: true } },
  RecommendedLessons: { type: 'Recommendation' },
};

const isStudioLessonBand = (type: string): type is StudioLessonBandType =>
  (STUDIO_LESSON_BAND_TYPES as readonly string[]).includes(type);

const toLessonBand = (band: StudioLessonBandResponse): HomeStudioLessonBand => ({
  ...BAND_VIEW[band.type],
  homeType: band.type,
  title: band.title,
  lessons: band.items ?? [],
});

export const parseHomeBands = (res: GetHomeResponse): ParsedHome => {
  const parsed: ParsedHome = {
    alerts: [],
    unpaidPaymentRecords: res.unpaidPaymentRecords ?? [],
    studioLessonBands: [],
    myStudios: [],
    recommendedStudios: [],
    events: [],
    bundles: [],
    regularClasses: [],
    jumbotrons: [],
    todayLessons: [],
    weeklyLessons: [],
    ongoingLessons: [],
  };

  for (const band of res.bands ?? []) {
    if (isStudioLessonBand(band.type)) {
      parsed.studioLessonBands.push(toLessonBand(band as StudioLessonBandResponse));
      continue;
    }
    switch (band.type) {
      case 'Alerts': parsed.alerts = band.items ?? []; break;
      case 'MyStudio': parsed.myStudio = band.myStudio; break;
      case 'MyStudios': parsed.myStudios = band.items ?? []; break;
      case 'RecommendedStudios': parsed.recommendedStudios = band.items ?? []; break;
      case 'Events': parsed.events = band.items ?? []; break;
      case 'Bundles': parsed.bundles = band.items ?? []; break;
      case 'RegularClasses': parsed.regularClasses = band.items ?? []; break;
      case 'RoomSlots':
        parsed.roomSlots = band.roomSlots;
        parsed.myBookings = band.myBookings;
        break;
      case 'Jumbotrons': parsed.jumbotrons = band.items ?? []; break;
      case 'TodayLessons': parsed.todayLessons = band.items ?? []; break;
      case 'WeeklyLessons': parsed.weeklyLessons = band.items ?? []; break;
      case 'OngoingLessons': parsed.ongoingLessons = band.items ?? []; break;
      default: break; // 모르는 밴드는 무시
    }
  }

  return parsed;
}
