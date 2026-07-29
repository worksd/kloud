'use server'

import { api } from "@/app/api.client";

// 파트너 예약일정표 — 선택한 홀의 예약 목록. 토큰(파트너)로 스코프, studioRoomId만 지정.
export const getRoomBookingsByRoomAction = async ({ studioRoomId }: { studioRoomId: number }) => {
  return await api.roomBooking.list({ studioRoomId });
};
