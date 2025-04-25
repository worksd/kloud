'use server'
import { api } from "@/app/api.client";

export const selectAndUsePassAction = async ({passId, lessonId}: {passId: number, lessonId: number}) => {
  const res = await api.pass.use({ passId, lessonId})
  return res;
}