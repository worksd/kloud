'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getKioskApiServerAction } from '@/app/kiosk/kiosk.actions';

/**
 * 키오스크 QR 로그인 SSE 공통 훅 — 손님 로그인(/kiosks/:id/login/stream)과 운영자 로그인(/auth/kiosk-login/stream)이 같은 규약이다.
 *  - 매 스트림마다 새 code(32자 hex)를 만들고, 서버 API에 EventSource로 직접 붙는다(인증 헤더 불필요. API 서버 CORS가 키오스크 오리진을 허용해야 한다).
 *  - 이벤트의 code가 지금 code와 다르면 옛 스트림에서 늦게 온 것이라 버린다.
 *  - 서버는 5분이면 닫는다. EventSource의 같은-URL 자동 재연결을 막고(close) 새 code로 다시 연다 — 같은 code 재사용 금지.
 *  - 언마운트/enabled=false 면 닫는다.
 */
export type KioskLoginStreamStatus = 'connecting' | 'open' | 'error';

const RETRY_DELAY_MS = 1500;

export const newKioskLoginCode = (): string => {
  // 16~64자 [A-Za-z0-9_-]. randomUUID 하이픈 제거 → 32자 hex. (구형 웹뷰엔 randomUUID가 없을 수 있어 getRandomValues 폴백)
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().replace(/-/g, '');
  const bytes = new Uint8Array(16);
  if (c) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export function useKioskLoginStream<T extends { code: string }>({ streamPath, eventName, enabled = true, accept, onEvent }: {
  /** code를 받아 API 서버 기준 경로를 만든다. 예: (code) => `/auth/kiosk-login/stream?code=${code}` */
  streamPath: (code: string) => string;
  /** 'kiosk.login' | 'kiosk.operator-login' */
  eventName: string;
  enabled?: boolean;
  /** 이벤트 본문이 쓸 만한지(토큰이 있는지 등). false면 무시하고 계속 기다린다 */
  accept: (ev: T) => boolean;
  onEvent: (ev: T) => void;
}) {
  const [code, setCode] = useState<string>(() => newKioskLoginCode());
  const [status, setStatus] = useState<KioskLoginStreamStatus>('connecting');
  const [apiServer, setApiServer] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledRef = useRef(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const acceptRef = useRef(accept);
  acceptRef.current = accept;

  useEffect(() => {
    getKioskApiServerAction().then(setApiServer).catch(() => setStatus('error'));
  }, []);

  const closeStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
  }, []);

  useEffect(() => {
    if (!apiServer || !enabled) return;
    handledRef.current = false;
    setStatus('connecting');
    const es = new EventSource(`${apiServer}${streamPath(encodeURIComponent(code))}`);
    esRef.current = es;

    es.onopen = () => setStatus('open');
    es.addEventListener(eventName, (e) => {
      if (handledRef.current) return;
      let ev: T | null = null;
      try { ev = JSON.parse((e as MessageEvent<string>).data) as T; } catch { ev = null; }
      if (!ev || ev.code !== code || !acceptRef.current(ev)) return;
      handledRef.current = true;
      closeStream();
      onEventRef.current(ev);
    });
    es.onerror = () => {
      if (handledRef.current) return;
      closeStream();
      setStatus('error');
      retryRef.current = setTimeout(() => setCode(newKioskLoginCode()), RETRY_DELAY_MS);
    };

    return closeStream;
    // streamPath는 호출부가 인라인으로 넘기므로 의존성에서 뺀다(code가 바뀔 때만 다시 연다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiServer, enabled, code, eventName, closeStream]);

  return { code, status };
}
