'use server'
import { api } from "@/app/api.client";

export const getTimeTableAction = async ({studioId, baseDate}: {studioId: number, baseDate?: string}) => {
  return await api.studio.timeTable({
    studioId, baseDate
  });
}