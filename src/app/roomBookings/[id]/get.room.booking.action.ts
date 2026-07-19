'use server'

import { api } from "@/app/api.client";

// 홀 예약 상세 — GET /roomBookings/:id (@Auth, 본인/파트너만)
export const getRoomBookingAction = async (id: number) => {
  return await api.roomBooking.get({ id });
};
