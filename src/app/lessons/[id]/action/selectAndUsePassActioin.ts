'use server'
import { api } from "@/app/api.client";

export const selectAndUsePassAction = async ({passId, lessonId, studioRoomId, targetDate, startTime, endTime}: {
  passId: number,
  lessonId?: number,
  studioRoomId?: number,
  targetDate?: string,
  startTime?: string,
  endTime?: string,
}) => {
  const res = await api.pass.use({ passId, lessonId, studioRoomId, targetDate, startTime, endTime })
  return res;
}