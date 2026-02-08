'use server'

import { api } from "@/app/api.client";

export const getLessonGroupTicketsAction = async ({ page }: { page: number }) => {
  return await api.lessonGroupTicket.list({ page });
}
