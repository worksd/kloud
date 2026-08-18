// GET /home 통합 응답({bands})을 화면이 쓰기 좋은 평면 구조로 푼다.
// 밴드 순서 의존 대신 type으로 가르고, 모르는 type은 건너뛴다 — 밴드가 추가돼도 깨지지 않게.

import {
  GetHomeResponse,
  HomeAlertResponse,
  HomeLessonResponse,
  MyRoomBookingResponse,
  WebStudioResponse,
} from "@/app/endpoint/home.endpoint";
import { GetMyStudioResponse, GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";
import { BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";

export type ParsedHome = {
  // 사람에 매인 밴드 (로그인 시에만 채워진다)
  alerts: HomeAlertResponse[];
  myStudio?: GetMyStudioResponse;
  myStudios: GetStudioResponse[];
  recommendedStudios: GetStudioResponse[];
  events: GetEventResponse[];
  bundles: BundleSummaryResponse[];
  roomSlots?: RoomSlotsSummaryResponse;
  myBookings?: MyRoomBookingResponse[];
  // 수업 탐색 밴드 (누구나)
  jumbotrons: HomeLessonResponse[];
  todayLessons: HomeLessonResponse[];
  weeklyLessons: HomeLessonResponse[];
  ongoingLessons: HomeLessonResponse[];
  popularStudios: WebStudioResponse[];
}

export const parseHomeBands = (res: GetHomeResponse): ParsedHome => {
  const parsed: ParsedHome = {
    alerts: [],
    myStudios: [],
    recommendedStudios: [],
    events: [],
    bundles: [],
    jumbotrons: [],
    todayLessons: [],
    weeklyLessons: [],
    ongoingLessons: [],
    popularStudios: [],
  };

  for (const band of res.bands ?? []) {
    switch (band.type) {
      case 'Alerts': parsed.alerts = band.items ?? []; break;
      case 'MyStudio': parsed.myStudio = band.myStudio; break;
      case 'MyStudios': parsed.myStudios = band.items ?? []; break;
      case 'RecommendedStudios': parsed.recommendedStudios = band.items ?? []; break;
      case 'Events': parsed.events = band.items ?? []; break;
      case 'Bundles': parsed.bundles = band.items ?? []; break;
      case 'RoomSlots':
        parsed.roomSlots = band.roomSlots;
        parsed.myBookings = band.myBookings;
        break;
      case 'Jumbotrons': parsed.jumbotrons = band.items ?? []; break;
      case 'TodayLessons': parsed.todayLessons = band.items ?? []; break;
      case 'WeeklyLessons': parsed.weeklyLessons = band.items ?? []; break;
      case 'OngoingLessons': parsed.ongoingLessons = band.items ?? []; break;
      case 'PopularStudios': parsed.popularStudios = band.items ?? []; break;
      default: break; // 모르는 밴드는 무시
    }
  }

  return parsed;
}
