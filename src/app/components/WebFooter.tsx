'use client';

// PC 웹 상세 페이지(레일 없는 경로)용 공통 푸터 — 회사 정보 법적 표기.
// 브라우즈 루트에선 LNB(LnbFooter)가 같은 정보를 보여주므로 WebShell이 상세에서만 이걸 붙인다.
// 라벨은 StringResource(쿠키 로케일) — 회사 상호/주소 등 법적 표기 값 자체는 한국어 유지.
// 값·문구는 src/shared/company.ts 단일 출처.
// .web-footer: 라우트 전환(loading.tsx) 중 globals.css body:has 규칙이 숨긴다 — 깜빡임 방지.

import { useEffect, useState } from 'react';
import { COMPANY_INFO, LEGAL_LINKS } from '@/shared/company';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { localeKey } from '@/shared/cookies.key';

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
};

const isLocale = (v: string | undefined): v is Locale =>
  v === 'ko' || v === 'en' || v === 'jp' || v === 'zh';

export const WebFooter = () => {
  const [locale, setLocale] = useState<Locale>('ko');
  useEffect(() => {
    const cookieLocale = readCookie(localeKey);
    if (isLocale(cookieLocale)) setLocale(cookieLocale);
  }, []);

  return (
    <footer className="web-footer hidden lg:block border-t border-[#f0f1f3] bg-[#fafbfc]">
      {/* 중앙 정렬 없이 뷰포트 왼쪽에 붙인다 — 회사 정보 푸터의 통상 배치 */}
      <div className="w-full px-8 py-10 flex flex-col gap-5">
        {/* 링크 — 개인정보 처리방침은 관례상 이용약관보다 굵게 */}
        <div className="flex items-center gap-2 text-[13px]">
          <a
            href={LEGAL_LINKS.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#4E5968] hover:text-black transition-colors"
          >
            {getLocaleString({locale, key: 'privacy_agreement'})}
          </a>
          <span className="text-[#D1D5DB]">·</span>
          <a
            href={LEGAL_LINKS.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#6D7882] hover:text-black transition-colors"
          >
            {getLocaleString({locale, key: 'terms_of_use'})}
          </a>
        </div>

        {/* 회사 정보 — 상호·주소는 라벨 없이, 나머지는 '라벨 : 값' (파트너스 웹과 동일 문구).
            메타 항목은 한 줄에 2개씩 '|' 구분, 주소는 길어서 단독 줄 */}
        <div className="flex flex-col gap-1 text-[12px] leading-relaxed text-[#8A949E]">
          <span className="font-medium text-[#6D7882]">{COMPANY_INFO.name}</span>
          <span>
            {getLocaleString({locale, key: 'footer_representative'})} : {COMPANY_INFO.representative}
            <span className="mx-2 text-[#D1D5DB]">|</span>
            {getLocaleString({locale, key: 'footer_business_number'})} : {COMPANY_INFO.businessRegistrationNumber}
          </span>
          <span>
            {getLocaleString({locale, key: 'footer_ecommerce_number'})} : {COMPANY_INFO.eCommerceRegNumber}
            <span className="mx-2 text-[#D1D5DB]">|</span>
            {getLocaleString({locale, key: 'footer_customer_center'})} : {COMPANY_INFO.customerServicePhone}
          </span>
          <span>{COMPANY_INFO.address}</span>
        </div>

        <span className="text-[12px] text-[#B0B8BF]">
          © {new Date().getFullYear()} {COMPANY_INFO.copyrightName} All rights reserved.
        </span>
      </div>
    </footer>
  );
};
