'use client';

import React, { useEffect, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { getStoreLink } from "@/app/components/MobileWebViewTopBar";

const APP_STORE_URL = 'https://apps.apple.com/app/id6740252635';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rawgraphy.blanc';

// 웹(브라우저) 진입 시 dim + 앱 설치 유도 다이얼로그. 로그인/스토어 상단바 대체. 매 진입 노출.
export function AppInstallDialog({ locale, profileImageUrl }: { locale: Locale; profileImageUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  // 모바일 웹에서만, 세션당 1회 노출. 데스크톱은 열지 않음. (os 쿼리가 비어있을 수 있어 UA로 감지)
  useEffect(() => {
    const SEEN_KEY = 'app_install_dialog_seen';
    if (sessionStorage.getItem(SEEN_KEY)) return;   // 이번 세션에 이미 노출됨
    const ua = navigator.userAgent;
    let url: string | null = null;
    let show = false;
    if (/iPhone|iPad|iPod/i.test(ua)) { url = getStoreLink({ os: 'iOS' })?.url ?? APP_STORE_URL; show = true; }
    else if (/Android/i.test(ua)) { url = getStoreLink({ os: 'Android' })?.url ?? PLAY_STORE_URL; show = true; }
    // 데스크톱: 노출 안 함
    if (show) {
      setStoreUrl(url);
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, '1');
    }
  }, []);

  if (!open) return null;
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const openStore = (url: string) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-[fadeIn_180ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-[360px] rounded-3xl bg-white px-6 pt-7 pb-5 text-center animate-[slideUp_220ms_ease-out]">
        {profileImageUrl && (
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl overflow-hidden bg-[#F1F3F6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <h2 className="text-[18px] font-bold text-[#171717]">{t('app_install_title')}</h2>
        <p className="mt-2 text-[13px] text-[#86898C] leading-relaxed">{t('app_install_desc')}</p>

        {storeUrl ? (
          <button
            onClick={() => openStore(storeUrl)}
            className="mt-5 w-full h-13 py-4 rounded-2xl bg-[#171717] flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            <span className="text-[15px] font-bold text-white">{t('app_install_cta')}</span>
          </button>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => openStore(APP_STORE_URL)} className="w-full py-4 rounded-2xl bg-[#171717] active:scale-[0.98] transition-transform">
              <span className="text-[15px] font-bold text-white">App Store</span>
            </button>
            <button onClick={() => openStore(PLAY_STORE_URL)} className="w-full py-4 rounded-2xl bg-[#171717] active:scale-[0.98] transition-transform">
              <span className="text-[15px] font-bold text-white">Google Play</span>
            </button>
          </div>
        )}

        <button onClick={() => setOpen(false)} className="mt-3 w-full py-2 text-[13px] font-medium text-[#A0A5AB] active:opacity-60">
          {t('app_install_dismiss')}
        </button>
      </div>
    </div>
  );
}
