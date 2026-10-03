'use client';

import React, { useEffect, useState } from 'react';
import { Toast } from '@/app/components/Toast';

/**
 * 전역 토스트 — 어디서든 showToast('…')로 띄운다. 루트 레이아웃에 <ToastHost/> 한 번 마운트.
 *
 * 왜 네이티브 브릿지(window.KloudEvent.showToast)를 안 쓰나:
 * 브릿지가 없는 웹/PC는 물론이고 iOS 앱에서도 호출만 되고 화면에 아무것도 안 떠서(2026-10-04 수강생 등록에서 확인),
 * 성공 피드백이 통째로 사라졌다. 웹 토스트는 모든 환경에서 같은 모양으로 뜬다.
 *
 * 화면이 바로 닫히는 흐름(kloudNav.back 등)에서는 토스트가 같이 사라지므로, 호출부에서 TOAST_LINGER_MS 만큼 기다렸다가 닫는다.
 */
const EVENT = 'kloud:toast';
export const TOAST_LINGER_MS = 1400;

export const showToast = (message: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
};

export function ToastHost() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      if (!message) return;
      // 직전 토스트가 떠 있어도 새 메시지로 갈아끼운다 — key가 바뀌어 애니메이션도 다시 시작
      setToast({ id: ++seq, message });
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (!toast) return null;
  return <Toast key={toast.id} message={toast.message} onDone={() => setToast((cur) => (cur?.id === toast.id ? null : cur))}/>;
}
