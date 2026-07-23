'use client';

import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

// /payment-redirect는 결제기록 반영 대기 후 결제상세로 redirect한다. 그 동안 로딩을 보여준다.
// Suspense fallback이라 async(getLocale) 불가 → 클라이언트에서 locale 쿠키를 읽어 다국어 처리(기본 ko).
const readLocale = (): Locale => {
  if (typeof document === 'undefined') return 'ko';
  const m = document.cookie.match(new RegExp(`(?:^|; )${localeKey}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]) : 'ko';
  return (['ko', 'en', 'jp', 'zh'].includes(v) ? v : 'ko') as Locale;
};

export default function PaymentRedirectLoading() {
  const locale = readLocale();
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <div className="w-10 h-10 border-4 border-black/15 border-t-black rounded-full animate-spin" />
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-bold text-[#171717]">{getLocaleString({ locale, key: 'payment_processing_title' })}</p>
        <p className="text-[13px] text-[#8A949E]">{getLocaleString({ locale, key: 'payment_processing_desc' })}</p>
      </div>
    </div>
  );
}
