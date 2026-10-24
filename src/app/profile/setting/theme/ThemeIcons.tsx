// 테마 선택 항목 아이콘 — currentColor 선 아이콘(선택 시 흰색, 아니면 글자색). 20×20.
import React from "react";

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** 시스템 설정 — 반은 밝고 반은 어두운 원 */
export const SystemThemeIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>
  </svg>
);

/** 라이트 — 해 */
export const LightThemeIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

/** 다크 — 달 */
export const DarkThemeIcon = () => (
  <svg {...base}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
  </svg>
);
