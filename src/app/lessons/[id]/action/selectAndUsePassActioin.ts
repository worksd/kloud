'use server'
import { api } from "@/app/api.client";
import { revalidateTag } from "next/cache";

export const selectAndUsePassAction = async ({passId, lessonId, studioRoomId, startDate, endDate}: {
  passId: number,
  lessonId?: number,
  studioRoomId?: number,
  startDate?: string,
  endDate?: string,
}) => {
  const res = await api.pass.use({ passId, lessonId, studioRoomId, startDate, endDate })
  // @ts-ignore - Next.js 16 type definition issue
  if ('id' in res && lessonId) revalidateTag(`lesson:${lessonId}`);
  return res;
}
