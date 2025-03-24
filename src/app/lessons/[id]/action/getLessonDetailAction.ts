import { api } from "@/app/api.client";

export const getLessonDetailAction = async ({lessonId}: {lessonId: number}) => {
  return await api.lesson.get({id: lessonId});
}