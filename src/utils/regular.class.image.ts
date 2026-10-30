// 정규반 대표 이미지 — 반 이미지 > 담당(대표) 강사 프로필 > 학원 로고 순으로 폴백.
// 내 정규반 상세 히어로(모바일)·배너(PC)와 마이페이지 내 정규반 카드 썸네일이 같은 규칙을 쓴다.

import { StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";

export const resolveRegularClassImage = (
  regularClass: Pick<StudioRegularClassResponse, 'imageUrl' | 'artist'> | null | undefined,
  studio: { profileImageUrl?: string | null } | null | undefined,
): string | null =>
  regularClass?.imageUrl || regularClass?.artist?.profileImageUrl || studio?.profileImageUrl || null;
