'use client';

// 루트(/) 진입 시 viewport가 PC(lg+, 1024px+)면 /lessons로 replace.
// 모바일 viewport는 무동작 → welcome screen 그대로 노출.
// 앱 웹뷰(appVersion !== '')에서는 이 컴포넌트 자체가 렌더되지 않으므로 영향 없음.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const HomeRedirect = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      router.replace('/lessons');
    }
  }, [router]);
  return null;
};
