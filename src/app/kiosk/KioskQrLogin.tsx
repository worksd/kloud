'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone } from 'lucide-react';
import { getLocaleString } from '@/app/components/locale';
import { Locale } from '@/shared/StringResource';
import { KioskLoginEvent } from '@/app/endpoint/kiosk.endpoint';
import { useKioskLoginStream } from '@/app/kiosk/kiosk.login.stream';

/**
 * 손님 QR 로그인 패널 — 전화 입력 화면 옆. 운영자가 이미 로그인한 키오스크(kioskId 확정)에서만 쓴다.
 * GET /kiosks/:id/login/stream?code= (SSE) 를 열어 두고, QR에는 `${origin}/kiosk-login?kioskId=&code=`를 싣는다 —
 * 앱이 깔린 폰은 기본 카메라로 찍어도 유니버설 링크로 앱이 열리고, 앱의 /kiosk-login 페이지가 POST /kiosks/:id/login { code }를 부른다.
 * 'kiosk.login' 이벤트가 오면 onLogin으로 넘긴다(손님 토큰 포함). 운영자 기기 로그인은 KioskOperatorQrLogin.
 */
export const KioskQrLogin = ({ kioskId, locale, onLogin, variant = 'kiosk' }: {
  kioskId: number;
  locale: Locale;
  onLogin: (event: KioskLoginEvent) => void;
  variant?: 'kiosk' | 'admin';
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const { code, status } = useKioskLoginStream<KioskLoginEvent>({
    streamPath: (c) => `/kiosks/${kioskId}/login/stream?code=${c}`,
    eventName: 'kiosk.login',
    enabled: kioskId > 0,
    accept: (ev) => !!ev.accessToken,
    onEvent: onLogin,
  });

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
