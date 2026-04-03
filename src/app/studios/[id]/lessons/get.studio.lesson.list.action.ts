'use server'
import { api } from "@/app/api.client";

export const getStudioOngoingLessons = async ({studioId, page}: { studioId: number, page?: number }) => {
  return await api.lesson.listOngoingLessons({studioId, page})
}