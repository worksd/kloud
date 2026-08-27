/**
 * 키오스크 ↔ 네이티브 브릿지
 */

import type { PrinterLine } from "@/app/kiosk/kiosk.receipt";

// 운영자 로그인이 완료되면 토큰을 네이티브 안전 저장소에 보관
export const sendKioskTokenToNative = (token: string) => {
  if (typeof window === 'undefined') return;
  if (!token) return;
  window.KloudEvent?.saveKioskToken?.(token);
};

// 시리얼 프린터로 영수증 lines 페이로드 송출 — 응답은 window.onSerialPrintResult로
export const sendReceiptToPrinter = (lines: PrinterLine[]): void => {
  if (typeof window === 'undefined') return;
  if (!lines || lines.length === 0) return;
  window.KloudEvent?.requestSerialPrint?.(JSON.stringify({ lines }));
};

// 네이티브 HID QR 스캐너(startQrScan/onQrScanResult)가 달린 기기인지 — MAZIC 키오스크 본체만 해당.
// 서버가 x-guinness-device-name 으로 쓰는 device.model 도 UA에서 파싱한 값이라, 클라이언트에선 UA 문자열로 동일하게 판별한다.
// 그 외 기기(태블릿·PC·기타 안드로이드)는 출석 QR을 브라우저 카메라(QRScanner)로 읽는다.
export const hasNativeQrScanner = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toUpperCase().includes('MAZIC');
};
