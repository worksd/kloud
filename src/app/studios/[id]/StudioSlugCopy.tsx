'use client'

import React, { useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    /* fallback below */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
};

// 커버 하단 slug(앱 아이콘 + @핸들) — 탭하면 스튜디오 웹 주소({baseUrl}/@슬러그)를 복사하고 토스트.
// baseUrl은 서버(GUINNESS_API_SERVER)에서 prod/staging 판단해 내려준다.
export const StudioSlugCopy = ({ slug, baseUrl, locale }: { slug: string; baseUrl: string; locale: Locale }) => {
  const [toast, setToast] = useState<{ msg: string; closing: boolean } | null>(null);
  const timers = useRef<number[]>([]);

  const handle = slug.replace(/^@/, '');

  const onCopy = async () => {
    const webUrl = `${baseUrl}/@${handle}`;
    await copyToClipboard(webUrl);
    const msg = getLocaleString({ locale, key: 'studio_address_copied' });
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setToast({ msg, closing: false });
    // 잠깐 노출 후 closing으로 전환(toastOut) → 애니메이션 끝나면 언마운트
    timers.current.push(window.setTimeout(() => setToast((prev) => (prev ? { ...prev, closing: true } : prev)), 1600));
    timers.current.push(window.setTimeout(() => setToast(null), 1820));
  };

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className="mt-1.5 flex items-center gap-1.5 max-w-full min-w-0 active:opacity-60 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ic_app.png" alt="" className="w-5 h-5 shrink-0 rounded-[5px] object-cover" />
        <span className="font-paperlogy text-[13px] text-[#131517] leading-[1.4] truncate">
          {`@${handle}`}
        </span>
      </button>
      {toast && (
        <div className="fixed left-0 right-0 bottom-10 z-50 flex justify-center px-6 pointer-events-none">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#191F28]/95 backdrop-blur-sm shadow-lg shadow-black/25 ${
              toast.closing ? 'animate-[toastOut_200ms_ease-in_forwards]' : 'animate-[toastIn_220ms_ease-out]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/ic_app.png" alt="" className="w-[18px] h-[18px] rounded-[5px] object-cover shrink-0" />
            <span className="text-white text-[14px] font-medium leading-none">{toast.msg}</span>
          </div>
        </div>
      )}
    </>
  );
};
