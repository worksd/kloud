'use server'
import { api } from "@/app/api.client";

export const getStudioOngoingLessons = async ({studioId, page, type}: { studioId: number, page: number, type?: string }) => {
  return await api.lesson.listOngoingLessons({studioId: studioId, page: page, type: type ?? ''})
}