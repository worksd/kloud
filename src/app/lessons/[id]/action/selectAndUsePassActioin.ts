'use server'
import { api } from "@/app/api.client";

export const selectAndUsePassAction = async ({passId, lessonId, studioRoomId, startDate, endDate}: {
  passId: number,
  lessonId?: number,
  studioRoomId?: number,
  startDate?: string,
  endDate?: string,
}) => {
  return await api.pass.use({ passId, lessonId, studioRoomId, startDate, endDate })
}
