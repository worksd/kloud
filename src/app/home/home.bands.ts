// GET /home 통합 응답({bands})을 화면이 쓰기 좋은 평면 구조로 푼다.
// 밴드 순서 의존 대신 type으로 가르고, 모르는 type은 건너뛴다 — 밴드가 추가돼도 깨지지 않게.

import {
  GetHomeResponse,
  HomeAlertResponse,
  HomeLessonResponse,
  HomeUnpaidPaymentRecordResponse,
  MyRoomBookingResponse,
  WebStudioResponse,
} from "@/app/endpoint/home.endpoint";
import { GetMyStudioResponse, GetStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";
import { BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";
// TODO(2026-10-30) ★★★ main 배포 전 반드시 삭제 ★★★ 미납 목 import — 서버가 unpaidPaymentRecords 내려주면 아래 적용 줄과 함께 지울 것 (unpaid.records.mock.ts 참고)
import { unpaidRecordsMockEnabled, withUnpaidRecordsMock } from "@/app/home/unpaid.records.mock";

export type ParsedHome = {
  // 사람에 매인 밴드 (로그인 시에만 채워진다)
  alerts: HomeAlertResponse[];
  /** 미납 결제건(정규반) — 밴드가 아니라 응답 루트 필드 */
  unpaidPaymentRecords: HomeUnpaidPaymentRecordResponse[];
  myStudio?: GetMyStudioResponse;
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
  popularStudios: WebStudioResponse[];
}

export const parseHomeBands = (res: GetHomeResponse): ParsedHome => {
  const parsed: ParsedHome = {
    alerts: [],
    unpaidPaymentRecords: res.unpaidPaymentRecords ?? [],
    myStudios: [],
    recommendedStudios: [],
    events: [],
    bundles: [],
    regularClasses: [],
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
      case 'RegularClasses': parsed.regularClasses = band.items ?? []; break;
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

  // TODO(2026-10-30) ★★★ main 배포 전 반드시 삭제 ★★★ 미납 목 적용 — 무조건 켜져 있어 운영에 나가면 모든 유저에게 가짜 미납 다이얼로그가 뜬다.
  // 서버가 unpaidPaymentRecords 를 주면 이 줄 + 위 import + unpaid.records.mock.ts 삭제 (모바일 /home·PC /myStudio 공통 경로)
  if (unpaidRecordsMockEnabled()) parsed.unpaidPaymentRecords = withUnpaidRecordsMock(parsed.unpaidPaymentRecords, parsed.regularClasses, parsed.myStudio?.studio);

  return parsed;
}
