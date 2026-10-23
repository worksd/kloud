'use client';

/**
 * 홈 리캡 인트로 노출 제어 (localStorage, 기기 단위).
 * - '돌아보기'를 누르거나 '다시 보지 않기'를 고르면 영구 숨김
 * - '나중에'로 닫으면 그날 하루만 숨김 → 다음 날 홈 진입 시 다시 뜬다
 * 저장소 접근이 막힌 환경(사생활 보호 모드 등)에서는 그냥 띄운다.
 */
const key = (year: number) => `recapIntro_${year}`;

const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD (로컬)

// TODO(2026-10-23): 지금은 확인용으로 홈 진입마다 항상 띄운다 — 노출 정책 확정되면 false 로
const ALWAYS_SHOW = true;

export const shouldShowRecapIntro = (year: number) => {
  if (ALWAYS_SHOW) return true;
  try {
    const v = localStorage.getItem(key(year));
    if (v === 'done') return false;
    return v !== today();
  } catch {
    return true;
  }
};

export const hideRecapIntro = (year: number, forever: boolean) => {
  try {
    localStorage.setItem(key(year), forever ? 'done' : today());
  } catch {
  }
};
