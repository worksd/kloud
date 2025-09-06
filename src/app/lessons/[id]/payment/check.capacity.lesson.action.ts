'use server'
import { api } from "@/app/api.client";

export const checkCapacityLessonAction = async ({lessonId}: {lessonId: number}) => {
  const res = await api.lesson.checkCapacity({ lessonId })
  return res
}