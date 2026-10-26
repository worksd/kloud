import React from "react";

// 게퍼 테이프 태그 — 연습실 바닥에 자리 표시하는 테이프처럼 끝이 뜯긴 듯 들쭉날쭉하고 살짝 기울어져 붙는다.
// 리캡 TapeLabel(애니메이션·큰 글씨)의 정적·작은 버전. 요일·미납 같은 짧은 라벨용.
// 색은 인라인 style 로 준다 — 다크 모드 PostCSS 가 클래스의 무채색을 뒤집으면 테이프 위 글자가 안 보이게 돼서.
export const TAPE = {
  black: { bg: '#111111', fg: '#FFFFFF' },
  cream: { bg: '#F4F1EA', fg: '#111111' },
  /** 주의 — 게퍼 노랑 */
  yellow: { bg: '#FFD400', fg: '#111111' },
} as const;

export const TapeTag = ({ children, tape = 'black', rotate = -2, className = '' }: {
  children: React.ReactNode;
  tape?: keyof typeof TAPE;
  rotate?: number;
  className?: string;
}) => (
  <span
    className={`inline-block px-[7px] py-[3px] text-[11px] font-black leading-none tracking-[-0.01em] whitespace-nowrap ${className}`}
    style={{
      background: TAPE[tape].bg,
      color: TAPE[tape].fg,
      clipPath: 'polygon(3% 10%, 97% 0%, 100% 45%, 96% 94%, 4% 100%, 0% 52%)',
      transform: `rotate(${rotate}deg)`,
    }}
  >
    {children}
  </span>
);
