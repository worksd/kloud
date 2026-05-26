'use server'

import { api } from "@/app/api.client";
import { SettleUpLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";

export const getLessonSettleUpAction = async ({ lessonId }: { lessonId: number }): Promise<SettleUpLessonResponse | null> => {
  try {
    const res = await api.lesson.getSettleUp({ id: lessonId });
    if (isGuinnessErrorCase(res)) return null;
    return res;
  } catch {
    return null;
  }
};
