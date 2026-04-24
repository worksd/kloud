'use server'

import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

export const getWeeklyLessonsAction = async (startDate?: string, endDate?: string) => {
  const studioId = (await cookies()).get(studioKey)?.value;
  if (!studioId) return { lessons: [] };

  return api.lesson.listByDate({
    studioId: Number(studioId),
    startDate,
    endDate,
  });
};
