'use server';

import { postPartnershipApplicant } from '@/app/forms/partnership.api';

// 폼 제출 — 파트너 공개 API로 서버에서 중계한다 (브라우저 직접 호출은 CORS).
// 마감·정원·중복 판정은 전부 서버 응답을 믿는다.
export const applyPartnershipAction = async (input: {
  code: string;
  name: string;
  phone: string;
  memo?: string;
  answers: Record<string, string | string[]>;
}) => {
  const { code, ...body } = input;
  return postPartnershipApplicant(code, body);
};
