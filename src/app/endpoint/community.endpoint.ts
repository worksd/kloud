import { Endpoint } from "@/app/endpoint/index";

// 커뮤니티 — 앱 노출 연습실을 보유한 스튜디오 목록.
export type CommunityStudioResponse = {
  id: number;
  name: string;
  address: string;
  imageUrl: string | null;
  // ── 기준 학원(query studioId) 전달 시 채워지는 값들 ──
  // null   = 기준 미전달 또는 기준 학원에 좌표 없음
  // 필드 없음(undefined) = 기준 학원 자기 자신 카드 (서버가 세 필드를 생략)
  /** 기준 학원에서의 직선거리(m, 반올림) */
  distanceMeter?: number | null;
  /** 도보 소요시간(분). 서버 계산식 ceil(distance × 1.3 / 80) — 클라에서 재계산하지 말 것 */
  walkingMinute?: number | null;
  /** 기준 학원 수강생이 이 학원 유료(Public) 연습실을 예약한 건수. Active·Used만, 기간 제한 없음. 없으면 0 */
  studentBookingCount?: number | null;
};

export type GetCommunityResponse = {
  practiceRoomStudios: CommunityStudioResponse[];
};

export type GetCommunityParameter = {
  /** 현재 선택된 스튜디오 id (쿠키 studio). 서버가 이 스튜디오 기준으로 목록을 구성한다. 없으면 미전송. */
  studioId?: number;
};

// GET /community (@OptionalAuth)
export const GetCommunity: Endpoint<GetCommunityParameter, GetCommunityResponse> = {
  method: 'get',
  path: '/community',
  queryParams: ['studioId'],
};
