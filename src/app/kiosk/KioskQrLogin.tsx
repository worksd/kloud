'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone } from 'lucide-react';
import { getLocaleString } from '@/app/components/locale';
import { Locale } from '@/shared/StringResource';
import { KioskLoginEvent } from '@/app/endpoint/kiosk.endpoint';
import { getKioskApiServerAction } from '@/app/kiosk/kiosk.actions';

/**
 * 키오스크 QR 로그인 패널 — 전화 입력 화면 옆에 붙는다.
 *
 * 1. 매 스트림마다 새 code(32자 hex)를 만들고 GET /kiosks/:id/login/stream?code= (SSE)를 EventSource로 연다.
 *    인증 헤더가 필요 없어 브라우저가 API 서버에 직접 붙는다(API 서버의 CORS가 키오스크 오리진을 허용해야 한다).
 * 2. QR에는 `${origin}/kiosk-login?kioskId=&code=`를 싣는다 — 앱이 깔린 폰은 기본 카메라로 찍어도 유니버설 링크로 앱이 열리고,
 *    앱의 /kiosk-login 페이지가 자기 토큰으로 POST /kiosks/:id/login { code }를 부른다.
 * 3. 'kiosk.login' 이벤트가 오면 code가 지금 QR과 같은지 확인하고 스트림을 닫은 뒤 onLogin으로 넘긴다.
 * 4. 서버는 5분이면 스트림을 닫는다. EventSource는 같은 URL로 자동 재연결하므로 onerror에서 close하고 새 code로 다시 연다
 *    (같은 code 재사용 금지). 언마운트 시에도 닫는다 — 전화 입력 화면을 벗어나면 QR은 더 이상 유효하지 않다.
 */
type Status = 'connecting' | 'open' | 'error';

const EVENT_NAME = 'kiosk.login';
const RETRY_DELAY_MS = 1500;

const newCode = (): string => {
  // 16~64자 [A-Za-z0-9_-]. randomUUID 하이픈 제거 → 32자 hex. (구형 웹뷰엔 randomUUID가 없을 수 있어 getRandomValues 폴백)
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().replace(/-/g, '');
  const bytes = new Uint8Array(16);
  if (c) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export const KioskQrLogin = ({ kioskId, locale, onLogin, variant = 'kiosk' }: {
  kioskId: number;
  locale: Locale;
  onLogin: (event: KioskLoginEvent) => void;
  variant?: 'kiosk' | 'admin';
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [code, setCode] = useState<string>(() => newCode());
  const [status, setStatus] = useState<Status>('connecting');
  const [apiServer, setApiServer] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledRef = useRef(false);
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;

  useEffect(() => {
    getKioskApiServerAction().then(setApiServer).catch(() => setStatus('error'));
  }, []);

  const closeStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
  }, []);

  useEffect(() => {
    if (!apiServer || !kioskId) return;
    handledRef.current = false;
    setStatus('connecting');
    const es = new EventSource(`${apiServer}/kiosks/${kioskId}/login/stream?code=${encodeURIComponent(code)}`);
    esRef.current = es;

    es.onopen = () => setStatus('open');
    es.addEventListener(EVENT_NAME, (e) => {
      if (handledRef.current) return;
      let ev: KioskLoginEvent | null = null;
      try { ev = JSON.parse((e as MessageEvent<string>).data) as KioskLoginEvent; } catch { ev = null; }
      // 옛 스트림에서 늦게 온 이벤트는 버린다
      if (!ev || ev.code !== code || !ev.accessToken) return;
      handledRef.current = true;
      closeStream();
      onLoginRef.current(ev);
    });
    es.onerror = () => {
      if (handledRef.current) return;
      // 서버가 5분 상한으로 닫았거나 네트워크 오류 — 자동 재연결(같은 code)을 막고 새 code로 다시 연다
      closeStream();
      setStatus('error');
      retryRef.current = setTimeout(() => setCode(newCode()), RETRY_DELAY_MS);
    };

    return closeStream;
  }, [apiServer, kioskId, code, closeStream]);

  const qrValue = typeof window !== 'undefined'
    ? `${window.location.origin}/kiosk-login?kioskId=${kioskId}&code=${encodeURIComponent(code)}`
    : '';
  const admin = variant === 'admin';
  const qrSize = admin ? 132 : undefined;

  return (
    <div
      className={`flex items-center rounded-[20px] bg-[#F7F8FA] border border-[#EEF0F2] ${admin ? 'gap-[20px] px-[20px] py-[16px]' : 'gap-[min(2vw,22px)] px-[min(2.2vw,24px)] py-[min(1.6vw,18px)]'}`}
    >
      <div
        className="relative shrink-0 rounded-[14px] bg-white p-[8px] border border-[#EEF0F2]"
        style={admin ? undefined : { width: 'min(15vw, 164px)', height: 'min(15vw, 164px)' }}
      >
        {/* QR — 스트림이 안 열렸으면 흐리게. 열리면 선명하게 */}
        <div className={`w-full h-full flex items-center justify-center transition-opacity ${status === 'open' ? 'opacity-100' : 'opacity-30'}`}>
          {qrValue && (
            <QRCodeCanvas value={qrValue} size={qrSize ?? 512} level="M" style={admin ? undefined : { width: '100%', height: '100%' }}/>
          )}
        </div>
        {status !== 'open' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 border-[3px] border-black/15 border-t-black/60 rounded-full animate-spin"/>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[8px] text-black">
          <Smartphone size={admin ? 20 : 22} strokeWidth={1.8} className="shrink-0"/>
          <p className="font-bold leading-tight" style={{ fontSize: admin ? 19 : 'min(2.1vw, 24px)' }}>{t('kiosk_qr_login_title')}</p>
        </div>
        <p className="mt-[6px] text-[#6D7882] leading-snug whitespace-pre-line" style={{ fontSize: admin ? 14 : 'min(1.5vw, 17px)' }}>
          {t('kiosk_qr_login_desc')}
        </p>
        <p className="mt-[8px] text-[#9AA3AD]" style={{ fontSize: admin ? 12 : 'min(1.2vw, 14px)' }}>
          {status === 'open' ? t('kiosk_qr_login_ready') : status === 'error' ? t('kiosk_qr_login_reconnecting') : t('kiosk_qr_login_connecting')}
        </p>
      </div>
    </div>
  );
};
