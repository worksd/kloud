'use server'

import { api } from "@/app/api.client";

// 내 대관 예약 목록 — GET /roomBookings (@Auth, 본인 예약만)
export const getRoomBookingsAction = async () => {
  return await api.roomBooking.list({});
};
