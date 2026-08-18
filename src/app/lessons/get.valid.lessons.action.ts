'use server'
import { api } from "@/app/api.client";

// 예약 가능 수업 전체 목록 (GET /lessons/valid) — PC 홈 그리드의 무한 스크롤에서 클라이언트 호출용
export const getValidLessonsAction = async ({ page }: { page: number }) => {
  return api.lesson.listValidLessons({ page });
};
