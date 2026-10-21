'use client';

import { useEffect } from 'react';

// 404 진입을 Discord 웹훅으로 보고 — 화면은 그리지 않는다 (not-found.tsx가 서버 컴포넌트로 ErrorView를 그린다)
export function NotFoundReporter() {
  useEffect(() => {
    fetch('/api/error-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: { name: 'NotFound', message: `404: ${window.location.pathname}` },
        context: {
          pathname: window.location.pathname,
          route: window.location.pathname + window.location.search,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          statusCode: 404,
          env: process.env.NEXT_PUBLIC_ENV ?? 'unknown',
        },
      }),
    }).catch(console.error);
  }, []);
  return null;
}
