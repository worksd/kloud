'use server';

import { api } from "@/app/api.client";
import { LessonListResponse } from "@/app/endpoint/lesson.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function getLessonGroupLessonsAction({
  id,
  year,
  month,
  page,
}: {
  id: number;
  year?: number;
  month?: number;
  page?: number;
}): Promise<LessonListResponse | GuinnessErrorCase> {
  return await api.lessonGroup.getLessons({id, year, month, page});
}
