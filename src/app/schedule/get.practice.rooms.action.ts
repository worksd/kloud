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
