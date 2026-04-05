'use server'

import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

export const getPracticeRoomsAction = async (date?: string) => {
  const studioId = (await cookies()).get(studioKey)?.value;
  if (!studioId) return { studioRooms: [] };

  return api.studioRoom.list({
    studioId: Number(studioId),
    practiceOnly: true,
    date,
  });
};

export const getRoomAvailabilityAction = async (
  roomId: number,
  date: string,
  targetDate?: string,
  startTime?: string,
  endTime?: string,
) => {
  return api.studioRoom.getAvailability({ id: roomId, date, targetDate, startTime, endTime });
};
