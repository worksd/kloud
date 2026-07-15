'use server';
import { api } from "@/app/api.client";

// 키오스크 연습실 예약 — 스튜디오의 연습실(룸) 목록 조회.
// 스튜디오 ID는 운영자 /me에서 온 값을 프롭으로 받아 명시적으로 전달 (스튜디오 쿠키 미사용).
export const getKioskPracticeRoomsAction = async (params: { studioId: number; date?: string }) => {
  return await api.studioRoom.list({
    studioId: params.studioId,
    practiceOnly: true,
    date: params.date,
  });
};

// 키오스크 연습실 예약 — 특정 룸의 날짜별 가용 슬롯 조회.
export const getKioskRoomAvailabilityAction = async (params: { roomId: number; date: string }) => {
  return await api.studioRoom.getAvailability({ id: params.roomId, date: params.date });
};
