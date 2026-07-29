'use server';
import { api } from "@/app/api.client";

// 키오스크 대관 예약 — 스튜디오의 홀(룸) 목록 조회 (id 확보용).
// studioId는 운영자 /me에서 온 값을 프롭으로 받아 명시적으로 전달 (스튜디오 쿠키 미사용).
// practiceOnly 미지정 시 전체 홀.
export const getKioskStudioRoomsAction = async (params: { studioId: number; practiceOnly?: boolean }) => {
  return await api.studioRoom.list({
    studioId: params.studioId,
    practiceOnly: params.practiceOnly,
  });
};

// 키오스크 대관 예약 — 여러 홀의 특정 날짜 슬롯을 한 번에 조회.
export const getKioskRoomsAvailabilityAction = async (params: { studioRoomIds: string; date: string }) => {
  return await api.studioRoom.availability({ studioRoomIds: params.studioRoomIds, date: params.date });
};

// 키오스크 대관 예약 — 스튜디오의 특정 날짜 방별 예약 가능 시각(availableHours) 요약.
// GET /studios/:id/roomSlots. 예약 가능 여부 판단용(가격은 홀 목록 schedules로 계산).
export const getKioskRoomSlotsAction = async (params: { studioId: number; date: string }) => {
  return await api.studioRoom.slots({ id: params.studioId, date: params.date });
};
