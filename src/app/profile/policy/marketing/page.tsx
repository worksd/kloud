'use client';

import { useEffect, useState } from "react";
import Marketing from "@/app/profile/policy/marketing/Marketing";
import Cookies from "js-cookie";
import { localeKey } from "@/shared/cookies.key";

// Marketing은 inline 콘텐츠로 렌더링 — Terms와 동일한 page 패턴 유지.
export default function MarketingPage() {
  const [locale, setLocale] = useState('ko');

  useEffect(() => {
    const cookieLocale = Cookies.get(localeKey);
    if (cookieLocale) {
      setLocale(cookieLocale);
    }
  }, []);

  return (
    <div>
      <Marketing locale={locale}/>
    </div>
  )
}
