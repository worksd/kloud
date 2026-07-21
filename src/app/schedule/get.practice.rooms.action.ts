'use server'

import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

// 홀 목록(홀정보만, 슬롯 없음)
export const getPracticeRoomsAction = async () => {
  const studioId = (await cookies()).get(studioKey)?.value;
  if (!studioId) return { studioRooms: [] };

  return api.studioRoom.list({
    studioId: Number(studioId),
    practiceOnly: true,
  });
};

// 홀 상세 홀정보 (GET /studioRooms/:id) — 예약 현황은 별도.
export const getRoomInfoAction = async (roomId: number) => {
  return api.studioRoom.get({ id: roomId });
};

// 홀 하나의 특정 날짜 예약 현황(슬롯 + 로그인 시 buttons·myBookings·lessons). rooms[0] 사용.
export const getRoomAvailabilityAction = async (roomId: number, date: string) => {
  return api.studioRoom.availability({ studioRoomIds: String(roomId), date });
};
