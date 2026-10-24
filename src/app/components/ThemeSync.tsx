'use client'

import { useEffect } from "react";
import { applyThemeToDocument, ThemePreference } from "@/shared/theme";

/**
 * 화면 테마 동기화 — 루트 레이아웃에 한 번 둔다.
 *  - 'system' 이면 OS 설정 변경(matchMedia change)을 듣고 <html data-theme> 을 따라 바꾼다.
 *    첫 페인트는 head 의 SYSTEM_THEME_BOOT_SCRIPT 가 맞추고, 이 컴포넌트는 그 뒤 변경만 처리.
 *  - 'light' | 'dark' 는 서버가 속성을 찍어 보내므로 할 일이 없다.
 * 설정 화면에서 바꿀 때는 ThemeChangeForm 이 applyThemeToDocument 로 즉시 반영한다 (리로드 없음).
 */
export const ThemeSync = ({ preference }: { preference: ThemePreference }) => {
  useEffect(() => {
    if (preference !== 'system') return;
    applyThemeToDocument('system');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeToDocument('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);
  return null;
};
