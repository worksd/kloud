'use client';

import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Privacy from "@/app/profile/policy/privacy/Privacy";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { localeKey } from "@/shared/cookies.key";

export default function PrivacyPage() {
  const [locale, setLocale] = useState('ko');

  useEffect(() => {
    const cookieLocale = Cookies.get(localeKey);
    if (cookieLocale) {
      setLocale(cookieLocale);
    }
  }, []);

  return (
    <div>
      <Privacy locale={locale}/>
    </div>
  )
}