'use server'

import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

// 수업 상세(버튼 + 장르·레벨·가격·아티스트·홀 등)를 가져온다. 바텀시트 정보 + 결제 route에 사용.
export const getStudioLessonDetailAction = async ({ lessonId }: { lessonId: number }): Promise<GetLessonResponse | null> => {
  const res = await api.lesson.get({ id: lessonId });
  if (res && typeof res === 'object' && 'id' in res) {
    return res as GetLessonResponse;
  }
  return null;
};
