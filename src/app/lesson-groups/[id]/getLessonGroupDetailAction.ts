'use server';

import { api } from "@/app/api.client";
import { GetLessonGroupResponse } from "@/app/endpoint/lesson.endpoint";
import { GuinnessErrorCase } from "@/app/guinnessErrorCase";

export async function getLessonGroupDetailAction({id}: {id: number}): Promise<GetLessonGroupResponse | GuinnessErrorCase> {
  return await api.lessonGroup.get({id});
}
