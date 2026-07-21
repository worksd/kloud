'use server';

import { api } from "@/app/api.client";

// 커뮤니티 목록 — 앱 노출 연습실 보유 스튜디오 (GET /community, @OptionalAuth)
export const getCommunityAction = async () => {
  return await api.community.get({});
};

// 커뮤니티 상세 — 스튜디오의 연습실(룸) 목록(홀정보만, 슬롯 없음). studioId 명시(쿠키 미사용).
export const getCommunityRoomsAction = async (params: { studioId: number }) => {
  return await api.studioRoom.list({
    studioId: params.studioId,
    practiceOnly: true,
  });
};

// 커뮤니티 상세 — 학원 전 홀의 특정 날짜 예약 현황(슬롯). 로그인 시 방마다 buttons·myBookings 포함.
export const getCommunityRoomsAvailabilityAction = async (params: { studioId: number; date: string }) => {
  return await api.studioRoom.availability({ studioId: params.studioId, date: params.date });
};
