'use server'

import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";
import { LessonStatus } from "@/app/endpoint/lesson.endpoint";

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

export const getWeeklyLessonsAction = async (startDate?: string, endDate?: string) => {
  const studioId = (await cookies()).get(studioKey)?.value;
  if (!studioId) return { lessons: [] };

  const res = await api.lesson.listByDate({
    studioId: Number(studioId),
    startDate,
    endDate,
  });
  if ('lessons' in res) {
    return { ...res, lessons: res.lessons.filter(l => l.status !== LessonStatus.Cancelled) };
  }
  return res;
};
