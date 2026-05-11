'use client'

import { getCookiesForNativeAction } from "@/app/splash/get.cookies.for.native.action";

/**
 * 현재 쿠키 상태를 네이티브로 push.
 * 네이티브 측은 saveCookies를 full-replace 시맨틱으로 구현 →
 * 받은 payload에 없는 키는 native 저장소에서 삭제됨.
 *
 * 호출 시점:
 * - splash 진입 시 (양방향 sync 마무리)
 * - clearCookies / clearAllCookies 직후 (로그아웃 즉시 동기화)
 * - 기타 쿠키 변경 후 즉시 native에도 반영하고 싶을 때
 */
export async function syncCookiesToNative() {
  try {
    const values = await getCookiesForNativeAction();
    window.KloudEvent?.saveCookies?.(JSON.stringify(values));
  } catch (e) {
    console.warn('[syncCookiesToNative] failed', e);
  }
}
