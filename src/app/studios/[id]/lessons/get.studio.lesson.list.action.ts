'use server'
import { api } from "@/app/api.client";

export const getStudioLessonList = async ({studioId, page}: { studioId: number, page: number }) => {
  return await api.lesson.listStudioLessons({studioId: studioId, page: page})
}