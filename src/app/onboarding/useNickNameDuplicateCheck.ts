'use client'

import { useEffect, useRef, useState } from "react";
import { checkDuplicateUser } from "@/app/onboarding/action/check.duplicate.nickname.action";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

/**
 * - idle      : 비어 있거나 원래 닉네임 그대로 — 검사 대상 아님(제출 막지 않음)
 * - checking  : 입력 멈춘 뒤 0.5초 지나 API 대기 중(버튼은 안 막고, 제출 시 ensureChecked 로 즉시 검사)
 * - available : 서버가 사용 가능 응답
 * - duplicate : success:false 또는 중복 코드(NICKNAME_ALREADY_EXISTS 등) — 빨간 안내 + 제출 막음
 * - error     : 토큰 만료·네트워크 등 인프라성 실패만 — 제출은 막지 않는다(서버가 PATCH 에서 한 번 더 검사하므로 fail-open)
 */
export type NickNameCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'error';

const DEBOUNCE_MS = 500;

/** 중복과 무관한 인프라성 실패 — 이때만 fail-open(error). 그 외 비성공 응답은 전부 '중복'으로 본다 */
const INFRA_ERROR_CODES = new Set<string>([
  ExceptionResponseCode.UNKNOWN_ERROR,
  ExceptionResponseCode.APP_UPGRADE_REQUIRED,
  'TOKEN_EXPIRED',
  'HEADERS_NOT_FOUND',
]);

/**
 * 중복검사 응답 판정 — 버튼을 열어 주는 건 서버가 명시적으로 { success: true } 를 준 경우뿐이다.
 *  - { success: true }  → 사용 가능
 *  - { success: false } → 중복
 *  - { code, message }  → 토큰 만료·헤더 누락·UNKNOWN 같은 인프라성 코드만 error(fail-open), 나머지 코드는 전부 중복
 *  - 그 외 모양        → 중복(모르는 응답으로 버튼이 열리느니 막는 쪽이 안전. PATCH 에서도 어차피 막힌다)
 * 2026-10-23: 중복 닉네임인데 code 가 기대와 달라 'error' 로 빠져 버튼이 열리고, 확인을 누르면 PATCH 에서 중복 에러가 나던 문제.
 */
const classify = (res: unknown): NickNameCheckStatus => {
  if (!res || typeof res !== 'object') return 'duplicate';
  const r = res as { success?: unknown; code?: unknown };
  if (typeof r.success === 'boolean') return r.success ? 'available' : 'duplicate';
  if (typeof r.code === 'string' && INFRA_ERROR_CODES.has(r.code)) return 'error';
  return 'duplicate';
};

export const useNickNameDuplicateCheck = (nickName: string, originalNickName?: string | null) => {
  const [status, setStatus] = useState<NickNameCheckStatus>('idle');
  const seq = useRef(0);
  // 지금 입력값 기준으로 '즉시 검사'를 할 수 있게 최신 값을 ref 로 보관 (ensureChecked 가 클로저에 갇히지 않게)
  const latest = useRef({ trimmed: '', skip: true });

  const runCheck = async (trimmed: string, my: number): Promise<NickNameCheckStatus> => {
    let next: NickNameCheckStatus = 'error';
    try {
      const res = await checkDuplicateUser({ nickName: trimmed });
      if (my !== seq.current) return 'checking'; // 그 사이 입력이 바뀜 — 호출자는 무시
      next = classify(res);
      if (next !== 'available' && process.env.NODE_ENV !== 'production') {
        console.warn('[nickName duplicate-check] 비성공 응답', res);
      }
    } catch {
      // 서버 액션 자체가 실패(네트워크 등) — fail-open
    }
    if (my === seq.current) setStatus(next);
    return next;
  };

  useEffect(() => {
    const trimmed = nickName.trim();
    const mine = (originalNickName ?? '').trim();
    const skip = trimmed.length === 0 || trimmed === mine;
    latest.current = { trimmed, skip };
    if (skip) {
      seq.current += 1; // 진행 중이던 요청 결과 무시
      setStatus('idle');
      return;
    }
    const my = ++seq.current;
    setStatus('checking');
    const timer = window.setTimeout(() => { void runCheck(trimmed, my); }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [nickName, originalNickName]);

  /**
   * 제출 직전에 호출 — 아직 0.5초가 안 지나 검사 대기 중이면 기다리지 않고 지금 바로 검사해서 결과를 돌려준다.
   * 버튼은 '중복 확정'일 때만 끄므로(검사 중엔 켜 둠) 입력 중 깜빡임이 없고, 대신 여기서 마지막 확인을 한다.
   * 반환: 'available' | 'idle' | 'error' 면 진행해도 됨, 'duplicate' 면 막아야 함.
   */
  const ensureChecked = async (): Promise<NickNameCheckStatus> => {
    if (latest.current.skip) return 'idle';
    if (status !== 'checking') return status;
    const my = ++seq.current; // 대기 중이던 debounce 결과는 버리고 이 호출이 최종
    return runCheck(latest.current.trimmed, my);
  };

  /** 제출을 막아야 하는 상태 — 중복 확정일 때만. 검사 중에는 막지 않는다(깜빡임 방지, ensureChecked 로 보완) */
  const blocksSubmit = status === 'duplicate';
  return { status, blocksSubmit, ensureChecked };
};

/** '{nickName}은(는) …' — 받침 유무로 은/는 선택. 한글이 아니면 '은(는)' 대신 '는'으로 둔다 */
export const withTopicParticle = (word: string) => {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${word}는`;
  return (code - 0xac00) % 28 === 0 ? `${word}는` : `${word}은`;
};
