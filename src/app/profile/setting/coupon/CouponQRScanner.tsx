'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// 쿠폰 등록 전용 미니멀 QR 스캐너 — 출석용 QRScanner의 헤더/디버그/타이틀을 제거하고
// 카메라 뷰포트 + 스캔 프레임만 표시.
type Props = {
  onSuccess: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
};

const REGION_ID = 'coupon-qr-reader';

export const CouponQRScanner = ({ onSuccess, onError }: Props) => {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 콜백을 ref로 보관해 의존성 변경으로 인한 스캐너 재시작 방지
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const start = useCallback(async () => {
    if (qrRef.current) return;
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        setError('카메라를 찾을 수 없어요');
        return;
      }
      // 후면 카메라 우선
      const back = cameras.find((c) => /back|rear|후면|environment/i.test(c.label));
      const cameraId = (back ?? cameras[0]).id;

      const qr = new Html5Qrcode(REGION_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      qrRef.current = qr;

      await qr.start(
        cameraId,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onSuccessRef.current?.(decodedText),
        (msg) => onErrorRef.current?.(msg),
      );
      setReady(true);
      setError(null);
    } catch (e) {
      setError('카메라를 시작할 수 없어요. 권한을 확인해주세요.');
      onErrorRef.current?.(String(e));
    }
  }, []);

  const stop = useCallback(async () => {
    const qr = qrRef.current;
    if (!qr) return;
    try { await qr.stop(); } catch { /* ignore */ }
    try { await qr.clear(); } catch { /* ignore */ }
    qrRef.current = null;
  }, []);

  useEffect(() => {
    start();
    return () => { void stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden rounded-2xl">
      {/* html5-qrcode가 비디오를 박는 영역 — 컨테이너 사이즈를 채우도록 강제 */}
      <div
        id={REGION_ID}
        className="absolute inset-0 [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover"
      />

      {/* 스캔 프레임 오버레이 */}
      {ready && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-[60%] aspect-square">
            {/* 4 모서리 */}
            <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-white rounded-tl-lg"/>
            <span className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-white rounded-tr-lg"/>
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-white rounded-bl-lg"/>
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-white rounded-br-lg"/>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {!ready && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
          <span className="text-[12px]">카메라 로드 중…</span>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <span className="text-[13px] text-white/80">{error}</span>
        </div>
      )}
    </div>
  );
};
