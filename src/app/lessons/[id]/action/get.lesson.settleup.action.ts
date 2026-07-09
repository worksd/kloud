'use server'

import { api } from "@/app/api.client";
import { ArtistSettlementStatementResponse } from "@/app/endpoint/lesson.endpoint";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";

// 통합 정산 조회 — GET /artist-settlements/statement?lessonId= (artistId 생략 시 담당 강사 전체).
// (구 GET /lessons/:id/settle-up 대체. record-aware: 강사별 status/adjustReason 포함)
export const getLessonSettleUpAction = async ({ lessonId }: { lessonId: number }): Promise<ArtistSettlementStatementResponse | null> => {
  try {
    const res = await api.lesson.getSettlementStatement({ lessonId });
    if (isGuinnessErrorCase(res)) return null;
    return res;
  } catch {
    return null;
  }
};
