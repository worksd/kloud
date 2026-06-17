'use server';

// 수업 상세 조회수 — POST /tracking-events fire-and-forget.
// 서버는 204 No Content + 실패해도 silent. catch로 감싸 호출자에게 에러 전파 안 함.

import { api } from "@/app/api.client";

export async function recordLessonViewAction({lessonId}: {lessonId: number}) {
  try {
    await api.trackingEvent.record({
      type: 'view',
      source: 'lessonDetail',
      sourceId: lessonId,
    });
  } catch {
    // 가이드: 클라가 재시도 불필요. 통계는 BI 기준이고 사용자 UX에 영향 없어야 함.
  }
}
