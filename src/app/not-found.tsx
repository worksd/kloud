'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // 리포팅은 그대로 남기고(깨진 링크 파악용) 화면만 보여주지 않고 루트로 보낸다.
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

    // replace라서 뒤로가기로 404가 다시 잡히지 않는다.
    router.replace('/');
  }, [router]);

  // 리다이렉트 되기 전 잠깐 뜨는 화면 — 404 UI 대신 빈 흰 화면.
  return <div className="min-h-screen bg-white"/>;
}