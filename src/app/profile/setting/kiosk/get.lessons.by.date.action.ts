'use server';
import { api } from "@/app/api.client";

export const getLessonsByDate = async (studioId: number, date: string) => {
  return await api.lesson.listByDate({
    studioId,
    date, // yyyy.MM.dd 형식
    isAdmin: true,
  });
};

