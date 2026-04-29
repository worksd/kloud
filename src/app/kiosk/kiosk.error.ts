'use client';

import { clearKioskOperatorTokenAction } from '@/app/kiosk/kiosk.actions';

// API 응답이 TOKEN_EXPIRED면 토큰 정리 후 키오스크 첫 단계(QR/이메일 로그인)로 보냄
// 호출자에게 true 반환 → 후속 처리를 중단할 수 있게
export const handleKioskTokenExpired = async (res: unknown): Promise<boolean> => {
  if (
    typeof res === 'object' &&
    res !== null &&
    'code' in res &&
    (res as { code?: string }).code === 'TOKEN_EXPIRED'
  ) {
    await clearKioskOperatorTokenAction();
    if (typeof window !== 'undefined') {
      window.location.href = '/kiosk';
    }
    return true;
  }
  return false;
};
