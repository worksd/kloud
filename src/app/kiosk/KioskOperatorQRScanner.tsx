'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  onScanned: (token: string) => void;
};

type QrScanPayload = {
  event: 'start' | 'result' | 'stopped' | 'error';
  success?: boolean;
  data?: string;
  error?: string;
  resultCode?: number;
  canceled?: boolean;
  source?: string;
};

type QrWindow = Window & { onQrScanResult?: (payload: QrScanPayload) => void };

export const KioskOperatorQRScanner = ({ onScanned }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [scannedRaw, setScannedRaw] = useState<string | null>(null);

  useEffect(() => {
    const w = window as QrWindow;
    let handled = false;

    w.onQrScanResult = (payload) => {
      if (!payload) return;
      if (payload.event === 'error') {
        setError(payload.error ?? '스캐너 초기화에 실패했습니다.');
        return;
      }
      if (payload.event !== 'result') return;
      if (!payload.success || !payload.data) {
        if (payload.canceled) return;
        setError(payload.error ?? '스캔에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      // 매 result마다 화면에 표시되는 데이터 갱신 (가장 최근 스캔)
      setScannedRaw(payload.data);
      if (handled) return;
      // URL에서 token 쿼리 추출. 단순 토큰 문자열일 수도 있어 fallback.
      let token: string | null = null;
      try {
        const u = new URL(payload.data);
        token = u.searchParams.get('token');
      } catch {
        token = payload.data;
      }
      if (!token) {
        setError('잘못된 QR입니다. 로그인 QR을 다시 확인해주세요.');
        return;
      }
      handled = true;
      onScanned(token);
    };

    window.KloudEvent?.startQrScan?.('');

    return () => {
      delete (window as QrWindow).onQrScanResult;
    };
  }, [onScanned]);

  return (
    <div className="bg-white w-full h-screen flex flex-col items-center justify-center px-[5%]">
      <p className="text-black font-bold text-center" style={{ fontSize: 'min(3vh,32px)' }}>
        로우그래피 앱에서 로그인 QR을 갖다대세요
      </p>
      <p className="text-[#86898C] mt-[12px] text-center" style={{ fontSize: 'min(1.8vh,20px)' }}>
        앱 홈 우측 상단의 QR 버튼을 눌러 화면을 가까이 대주세요
      </p>

      <div
        className="mt-[40px] rounded-[24px] bg-[#F2F4F6] flex items-center justify-center"
        style={{ width: 'min(60vw, 360px)', height: 'min(60vw, 360px)' }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#B1B8BE" strokeWidth="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#B1B8BE" strokeWidth="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#B1B8BE" strokeWidth="1.5"/>
          <path d="M14 14H17V17H14V14ZM18 14H21V17M14 18H17V21M18 18V21H21V18H18Z" stroke="#B1B8BE" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>

      {scannedRaw && (
        <div className="mt-[20px] w-full max-w-[720px] bg-[#F9F9FB] rounded-[12px] p-[14px] break-all">
          <p className="text-[#86898C] text-[12px] font-bold mb-[6px]">받은 데이터</p>
          <p className="text-[#1E2124] font-mono text-[12px]">{scannedRaw}</p>
        </div>
      )}

      {error && (
        <p className="mt-[20px] text-[#E53935] text-center" style={{ fontSize: 'min(1.6vh,18px)' }}>{error}</p>
      )}
    </div>
  );
};
