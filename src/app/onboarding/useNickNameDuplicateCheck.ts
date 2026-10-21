'use client'

import { useEffect, useRef, useState } from "react";
import { checkDuplicateUser } from "@/app/onboarding/action/check.duplicate.nickname.action";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";

/**
 * - idle      : 비어 있거나 원래 닉네임 그대로 — 검사 대상 아님(제출 막지 않음)
 * - checking  : 입력 멈춘 뒤 0.5초 지나 API 대기 중(제출 막음)
 * - available : 서버가 사용 가능 응답
 * - duplicate : 서버가 NICKNAME_ALREADY_EXISTS — 빨간 안내 + 제출 막음
 * - error     : 네트워크 등 그 외 실패 — 제출은 막지 않는다(서버가 PATCH 에서 한 번 더 검사하므로 fail-open)
 */
export type NickNameCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'error';

const DEBOUNCE_MS = 500;

/**
 * 닉네임 실시간 중복검사 — 입력이 멈추고 0.5초 지나면 POST /users/duplicate-check 를 쏜다 (2026-10-21).
 * 온보딩·프로필 수정 둘 다 쓴다. originalNickName(지금 내 닉네임)과 같으면 서버가 '내 것'을 중복으로 볼 수 있어 검사하지 않는다.
 * 응답이 늦게 도착한 이전 요청은 요청 번호로 걸러 마지막 입력값의 결과만 반영한다.
 */
export const useNickNameDuplicateCheck = (nickName: string, originalNickName?: string | null) => {
  const [status, setStatus] = useState<NickNameCheckStatus>('idle');
  const seq = useRef(0);

  useEffect(() => {
    const trimmed = nickName.trim();
    const mine = (originalNickName ?? '').trim();
    if (trimmed.length === 0 || trimmed === mine) {
      seq.current += 1; // 진행 중이던 요청 결과 무시
      setStatus('idle');
      return;
    }
    const my = ++seq.current;
    setStatus('checking');
    const timer = window.setTimeout(async () => {
      const res = await checkDuplicateUser({ nickName: trimmed });
      if (my !== seq.current) return; // 그 사이 입력이 바뀜
      if ('success' in res && res.success) setStatus('available');
      else if ('code' in res && res.code === ExceptionResponseCode.NICKNAME_ALREADY_EXISTS) setStatus('duplicate');
      else setStatus('error');
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [nickName, originalNickName]);

  /** 제출을 막아야 하는 상태 — 검사 대기 중이거나 중복 */
  const blocksSubmit = status === 'checking' || status === 'duplicate';
  return { status, blocksSubmit };
};

/** '{nickName}은(는) …' — 받침 유무로 은/는 선택. 한글이 아니면 '은(는)' 대신 '는'으로 둔다 */
export const withTopicParticle = (word: string) => {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${word}는`;
  return (code - 0xac00) % 28 === 0 ? `${word}는` : `${word}은`;
};
