'use server';
import { api } from "@/app/api.client";

/**
 * 기간 내 스튜디오 수업 목록 — QR 출석 달력에서 '수업 있는 날' 점을 찍기 위한 조회.
 * 하루치만 보는 getLessonsByDate 와 달리 달력에 보이는 6주(42칸) 범위를 한 번에 받는다.
 */
export const getLessonsByRange = async (studioId: number, startDate: string, endDate: string) => {
  return await api.lesson.listByDate({
    studioId,
    startDate, // yyyy.MM.dd 형식
    endDate,   // yyyy.MM.dd 형식
    isAdmin: true,
  });
};
