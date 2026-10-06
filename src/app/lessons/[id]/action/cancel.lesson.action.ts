'use server';

import { api } from "@/app/api.client";

/**
 * 관리자(수업 상세)가 수업 회차를 취소 — POST /lessons/:id/cancel.
 * 수강생 전원 취소·환불 + 알림톡. reason은 수강생에게 그대로 노출된다.
 */
export async function cancelLessonAction(lessonId: number, reason: string) {
  return await api.lesson.cancel({ id: lessonId, reason });
}
