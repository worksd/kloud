'use server'
import { api } from "@/app/api.client";

export const getStudioOngoingLessons = async ({studioId, page, all}: { studioId: number, page: number, all: boolean }) => {
  return await api.lesson.listOngoingLessons({studioId: studioId, page: page, all})
}