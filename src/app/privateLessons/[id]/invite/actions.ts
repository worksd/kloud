'use server'

import { api } from "@/app/api.client";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

// 수강생 검색 — 강사 경로라 studioId(소속 학원)를 함께 보낸다. 실패는 빈 목록.
export const searchStudentsAction = async ({ query, studioId }: { query: string; studioId: number }): Promise<GetUserResponse[]> => {
  try {
    const res = await api.user.search({ keyword: query, studioId });
    if ('users' in res) return res.users ?? [];
    return [];
  } catch {
    return [];
  }
};

// 등록 옵션 조회 — 결제 화면과 같은 GET /payment. targetUserId의 사용 가능 수강권 + 상품가를 받는다.
export const getRegistrationOptionsAction = async ({ lessonId, targetUserId, studioId }: {
  lessonId: number;
  targetUserId: number;
  studioId: number;
}) => {
  return await api.payment.get({ item: 'lesson', itemId: lessonId, targetUserId, studioId });
};

// 수강권으로 등록 — 수강생의 패스 사용 (강사 경로: studioId 동봉)
export const registerWithPassAction = async ({ passId, lessonId, studioId }: {
  passId: number;
  lessonId: number;
  studioId: number;
}) => {
  return await api.pass.use({ passId, lessonId, studioId });
};

// 현장결제로 등록 — methodType 'admin'. 금액은 서버가 상품가로 계산.
export const registerOnsiteAction = async ({ lessonId, targetUserId, studioId }: {
  lessonId: number;
  targetUserId: number;
  studioId: number;
}) => {
  return await api.paymentRecord.createManual({
    methodType: 'admin',
    item: 'lesson',
    itemId: lessonId,
    targetUserId,
    studioId,
  });
};
