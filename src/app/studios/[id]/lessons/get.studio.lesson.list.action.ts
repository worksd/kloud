'use server'
import { api } from "@/app/api.client";

export const getStudioLessonList = async ({studioId, page, type}: { studioId: number, page: number, type?: string }) => {
  return await api.lesson.listStudioLessons({studioId: studioId, page: page, type: type ?? ''})
}