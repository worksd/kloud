'use server';

import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function getLessonDetailAction({
  lessonId,
}: {
  lessonId: number;
}): Promise<GetLessonResponse | GuinnessErrorCase> {
  return await api.lesson.get({ id: lessonId });
}
