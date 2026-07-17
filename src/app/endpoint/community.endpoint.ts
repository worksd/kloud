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

// GET /community (@OptionalAuth, 파라미터 없음)
export const GetCommunity: Endpoint<object, GetCommunityResponse> = {
  method: 'get',
  path: '/community',
};
