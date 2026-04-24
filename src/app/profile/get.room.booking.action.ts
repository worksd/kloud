'use server'

import { api } from "@/app/api.client";

export const getRoomBookingAction = async (id: number) => {
  return api.roomBooking.get({ id });
};

export const deleteRoomBookingAction = async (id: number) => {
  return api.roomBooking.delete({ id, reason: '본인취소' });
};
