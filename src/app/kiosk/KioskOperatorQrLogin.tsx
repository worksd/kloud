'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { KioskOperatorLoginEvent } from '@/app/endpoint/auth.endpoint';
import { useKioskLoginStream } from '@/app/kiosk/kiosk.login.stream';

/**
 * 운영자(기기) QR 로그인 패널 — 키오스크 로그인 화면(이메일 로그인 카드) 위쪽.
 * 로그인 전이라 kioskId도 인증 헤더도 없다. GET /auth/kiosk-login/stream?code= (SSE)를 열어 두고
 * QR에는 BE 규약대로 `guinness://kiosk-operator-login?code=…`를 싣는다 — 파트너 앱 홈 '키오스크 로그인' 스캐너가 읽어
 * POST /auth/kiosk-login { code }로 승인하면 'kiosk.operator-login' 이벤트에 운영자 토큰(360일)이 실려 온다.
 */
export const KioskOperatorQrLogin = ({ onLoggedIn }: { onLoggedIn: (event: KioskOperatorLoginEvent) => void }) => {
  const { code, status } = useKioskLoginStream<KioskOperatorLoginEvent>({
    streamPath: (c) => `/auth/kiosk-login/stream?code=${c}`,
    eventName: 'kiosk.operator-login',
    accept: (ev) => !!ev.accessToken,
    onEvent: onLoggedIn,
  });
  const qrValue = `guinness://kiosk-operator-login?code=${encodeURIComponent(code)}`;

  return (
    <div className="flex items-center gap-[18px] rounded-[16px] bg-[#F7F8FA] border border-[#EEF0F2] px-[16px] py-[14px]">
      <div className="relative shrink-0 rounded-[12px] bg-white p-[6px] border border-[#EEF0F2]" style={{ width: 'min(20vh, 150px)', height: 'min(20vh, 150px)' }}>
        <div className={`w-full h-full flex items-center justify-center transition-opacity ${status === 'open' ? 'opacity-100' : 'opacity-30'}`}>
          <QRCodeCanvas value={qrValue} size={512} level="M" style={{ width: '100%', height: '100%' }}/>
        </div>
        {status !== 'open' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-[3px] border-black/15 border-t-black/60 rounded-full animate-spin"/>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#1E2124] font-bold leading-tight" style={{ fontSize: 'min(2vh, 20px)' }}>관리자 앱으로 로그인</p>
        <p className="mt-[6px] text-[#6D7882] leading-snug" style={{ fontSize: 'min(1.4vh, 14px)' }}>
          파트너 앱 홈 &gt; <b className="text-[#1E2124] font-semibold">키오스크 로그인</b>에서{'\n'}이 QR을 찍으면 바로 로그인돼요
        </p>
        <p className="mt-[8px] text-[#9AA3AD]" style={{ fontSize: 'min(1.2vh, 12px)' }}>
          {status === 'open' ? '스캔 대기 중' : status === 'error' ? 'QR을 새로 만드는 중…' : '준비 중…'}
        </p>
      </div>
    </div>
  );
};
