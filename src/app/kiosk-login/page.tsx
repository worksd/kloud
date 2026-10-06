import React from 'react';
import { api } from '@/app/api.client';
import { getLocale } from '@/utils/translate';
import { KioskLoginApprove } from '@/app/kiosk-login/KioskLoginApprove';

/**
 * 키오스크 QR 로그인 승인 진입점 — 키오스크 QR 값: `${origin}/kiosk-login?kioskId=7&code=…`
 * 앱이 깔린 폰은 유니버설 링크로 앱이 열리고(splash가 경로를 그대로 navigateMain), 앱 토큰으로 승인한다.
 * 비로그인(웹·앱 로그아웃 상태)이면 로그인 안내만 하고 승인은 부르지 않는다.
 */
export default async function KioskLoginPage({ searchParams }: {
  searchParams: Promise<{ kioskId?: string; code?: string }>;
}) {
  const { kioskId, code } = await searchParams;
  const id = kioskId && /^\d+$/.test(kioskId) ? Number(kioskId) : null;

  let isLoggedIn = false;
  try {
    const me = await api.user.me({});
    isLoggedIn = 'id' in me;
  } catch {
    // 비로그인으로 처리
  }
  const locale = await getLocale();

  return <KioskLoginApprove kioskId={id} code={code ?? null} locale={locale} isLoggedIn={isLoggedIn}/>;
}
