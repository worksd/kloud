'use client';

// PC(lg+, 1024px+) viewport에서만 지정 경로로 replace하는 공용 리다이렉터.
// 모바일 viewport는 무동작 — 서버는 viewport를 모르므로 클라이언트에서 분기한다.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const PcRedirect = ({ to }: { to: string }) => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      router.replace(to);
    }
  }, [router, to]);
  return null;
};
