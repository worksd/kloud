'use client';

import React, { useEffect } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const APP_STORE_URL = 'https://apps.apple.com/app/id6740252635';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rawgraphy.blanc';
const APP_SCHEME = 'rawgraphy';
const ANDROID_PACKAGE = 'com.rawgraphy.blanc';

// 웹(브라우저)에서 열렸을 때 앱을 켜주는 화면. 앱 딥링크는 splash에서 해석하므로 스킴에 경로를 그대로 붙인다.
// iOS: rawgraphy://<path> (미설치 시 App Store), Android: intent:// (미설치 시 browser_fallback_url로 Play스토어).
export function OpenInApp({ path, locale }: { path: string; locale: Locale }) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const cleanPath = path.replace(/^\/+/, '');

  const openApp = () => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      window.location.href =
        `intent://${cleanPath}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = `${APP_SCHEME}://${cleanPath}`;
      // 미설치면 스킴 이동이 무시됨 → 잠시 후 App Store로
      window.setTimeout(() => { window.location.href = APP_STORE_URL; }, 1500);
    }
    // 데스크톱: 스킴 없음 → 버튼(스토어)만 안내
  };

  // 진입 즉시 1회 시도(모바일)
  useEffect(() => {
    openApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-5 bg-white px-6 text-center">
      <div className="flex flex-col gap-1.5">
        <p className="text-[18px] font-bold text-[#171717]">{t('app_install_title')}</p>
        <p className="text-[13px] text-[#8A949E]">{t('open_in_app_desc')}</p>
      </div>
      <button
        onClick={openApp}
        className="w-full max-w-[320px] h-14 rounded-2xl bg-[#171717] flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        <span className="text-[16px] font-bold text-white">{t('open_in_app')}</span>
      </button>
      <div className="flex items-center gap-4 text-[13px] font-medium text-[#8A949E]">
        <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 active:opacity-60">App Store</a>
        <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 active:opacity-60">Google Play</a>
      </div>
    </div>
  );
}
