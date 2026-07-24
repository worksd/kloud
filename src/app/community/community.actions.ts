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

// 지정 홀들의 특정 날짜 예약 현황(슬롯). studioId 대신 studioRoomIds(콤마 구분)를 반드시 명시.
export const getRoomsAvailabilityByIdsAction = async (params: { studioRoomIds: string; date: string }) => {
  return await api.studioRoom.availability({ studioRoomIds: params.studioRoomIds, date: params.date });
};

// 스튜디오의 특정 날짜 방별 예약 가능 시각 요약(availableHours). 홈 roomSlots와 동일 형식.
// 상세에서 날짜를 바꿀 때 '예약 가능 시각' 판단용으로 호출(가격/내 예약은 availability로 별도 조회).
export const getStudioRoomSlotsAction = async (params: { studioId: number; date: string }) => {
  return await api.studioRoom.slots({ id: params.studioId, date: params.date });
};
