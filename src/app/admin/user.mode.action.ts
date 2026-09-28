'use server'

import { cookies } from 'next/headers';
import { userModeKey } from '@/shared/cookies.key';

// '일반 모드로 가기'로 켜지고, 다음 앱 실행(스플래시 → enterAfterAuth)에서 꺼진다.
// 그 사이에 앱이 죽어도 하루 뒤엔 자동으로 관리자 모드로 돌아오도록 만료를 짧게 둔다.
const USER_MODE_MAX_AGE = 24 * 60 * 60;

/**
 * 관리자의 '일반 모드' 토글.
 * on=true 면 /home 이 관리자 폼 대신 일반 홈을 렌더한다 (바텀 탭 첫 탭이 /home 공용이라 필요).
 */
export const setUserModeAction = async (on: boolean) => {
  const store = await cookies();
  if (on) {
    store.set(userModeKey, 'true', { maxAge: USER_MODE_MAX_AGE, sameSite: 'lax' });
  } else {
    store.delete(userModeKey);
  }
};
