'use client';

// PC 웹(lg+, 앱 웹뷰 아님)의 로그인 진입 통합 — 전용 로그인 페이지 대신
// /lessons?login=true로 replace해 공통 로그인 다이얼로그(WebTopNav) 하나로 모은다.
// 모바일 viewport는 무동작 → 기존 로그인 페이지 그대로. HomeRedirect와 동일 패턴.
// 카카오 OAuth 콜백(code 쿼리) 처리 중에는 렌더하지 말 것 — 코드 소비 전에 이탈하면 로그인이 끊긴다.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const WebLoginRedirect = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      router.replace('/lessons?login=true');
    }
  }, [router]);
  return null;
};
