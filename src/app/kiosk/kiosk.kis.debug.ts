'use client';

/**
 * KIS 단말 응답 수집 스토어 (클라 전역 싱글톤).
 *
 * 네이티브에서 오는 KIS 응답 채널은 두 개뿐이라 둘 다 여기로 흘린다:
 *  - window.onKisPaymentResult          → recordKisResponse('payment', ...)   (D1 결제 / D2 취소)
 *  - window.onKisTransactionQueryResult → recordKisResponse('query', ...)     (ST 거래상태조회)
 *
 * 환경별 동작:
 *  - staging → KisDebugOverlay가 구독해서 raw 응답을 화면에 전부 표시
 *  - prod    → reportKisResponseAction으로 Discord 전송 (fire-and-forget)
 * 환경 판정은 서버 액션(GUINNESS_API_SERVER)으로 최초 1회만 조회하고 캐시한다.
 */

import { getKisDebugEnvAction, reportKisResponseAction, type KisDebugEnv } from '@/app/kiosk/kiosk.debug.actions';

export type KisDebugEntry = {
  id: number;
  /** HH:mm:ss */
  time: string;
  kind: string;
  note?: string;
  payload: Record<string, unknown>;
};

const MAX_ENTRIES = 50;

let entries: KisDebugEntry[] = [];
let seq = 0;
let env: KisDebugEnv | null = null;
let envPromise: Promise<KisDebugEnv> | null = null;
let context: { kioskId?: number; kioskName?: string } = {};
const listeners = new Set<() => void>();

const notify = () => { listeners.forEach((fn) => fn()); };

/** 어느 키오스크에서 온 응답인지 Discord 리포트에 실어 보내기 위한 컨텍스트 */
export const setKisDebugContext = (next: { kioskId?: number; kioskName?: string }) => {
  context = { ...context, ...next };
};

/** 환경 조회 — 중복 호출돼도 서버 액션은 1회만 나간다 */
export const initKisDebug = (): Promise<KisDebugEnv> => {
  if (env) return Promise.resolve(env);
  if (!envPromise) {
    envPromise = getKisDebugEnvAction()
      .then((resolved) => { env = resolved; notify(); return resolved; })
      .catch(() => { env = 'unknown'; notify(); return 'unknown' as KisDebugEnv; });
  }
  return envPromise;
};

export const getKisDebugEnv = (): KisDebugEnv | null => env;
/** staging에서만 화면 오버레이 노출 */
export const isKisDebugVisible = (): boolean => env === 'staging';
export const getKisDebugEntries = (): KisDebugEntry[] => entries;

export const subscribeKisDebug = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

export const clearKisDebugEntries = () => { entries = []; notify(); };

/** KIS 응답 1건 기록 — 콘솔 + (staging)오버레이 + (prod)Discord */
export const recordKisResponse = (kind: string, payload: unknown, note?: string): void => {
  const safe: Record<string, unknown> = payload && typeof payload === 'object'
    ? (payload as Record<string, unknown>)
    : { value: payload };

  seq += 1;
  const entry: KisDebugEntry = {
    id: seq,
    time: new Date().toTimeString().slice(0, 8),
    kind,
    note,
    payload: safe,
  };
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  notify();
  console.log(`[KIS:${kind}]`, note ?? '', safe);

  // 환경이 아직 미확정이면 확정 후 판단. prod면 Discord로, 실패해도 결제 흐름엔 영향 없게 무시.
  initKisDebug()
    .then((resolved) => {
      if (resolved !== 'prod') return;
      return reportKisResponseAction({
        kind,
        note,
        payload: safe,
        kioskId: context.kioskId,
        kioskName: context.kioskName,
      });
    })
    .catch(() => {});
};
