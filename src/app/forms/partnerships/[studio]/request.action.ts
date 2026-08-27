'use server';

import { PartnershipRequestBody, postPartnershipRequest } from '@/app/forms/partnership.api';

// 파트너십 신청서 제출 — 파트너 관리자 공개 API로 서버에서 중계한다 (브라우저 직접 호출은 CORS).
// 중복·형식 판정은 서버 응답을 믿는다.
export const requestPartnershipAction = async (body: PartnershipRequestBody) => postPartnershipRequest(body);
