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
