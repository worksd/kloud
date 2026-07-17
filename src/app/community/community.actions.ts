'use server';

import { api } from "@/app/api.client";

// 커뮤니티 목록 — 앱 노출 연습실 보유 스튜디오 (GET /community, @OptionalAuth)
export const getCommunityAction = async () => {
  return await api.community.get({});
};

// 커뮤니티 상세 — 스튜디오의 연습실(룸) 목록. studioId 명시(쿠키 미사용).
export const getCommunityRoomsAction = async (params: { studioId: number; date?: string }) => {
  return await api.studioRoom.list({
    studioId: params.studioId,
    practiceOnly: true,
    date: params.date,
  });
};

// 커뮤니티 상세 — 특정 룸의 날짜별 실제 가용 슬롯.
export const getCommunityRoomAvailabilityAction = async (params: { roomId: number; date: string }) => {
  return await api.studioRoom.getAvailability({ id: params.roomId, date: params.date });
};
