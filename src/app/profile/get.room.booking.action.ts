'use server'

import { api } from "@/app/api.client";

export const getRoomBookingAction = async (id: number) => {
  return api.roomBooking.get({ id });
};
