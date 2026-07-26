import { Endpoint } from "@/app/endpoint/index";

// 커뮤니티 — 앱 노출 연습실을 보유한 스튜디오 목록.
export type CommunityStudioResponse = {
  id: number;
  name: string;
  address: string;
  imageUrl: string | null;
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
