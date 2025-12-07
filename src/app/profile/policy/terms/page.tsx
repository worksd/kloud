'use client';

import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { useEffect, useState } from "react";
import Term from "@/app/profile/policy/terms/Term";
import Cookies from "js-cookie";
import { localeKey } from "@/shared/cookies.key";

export default function TermPage() {
  const [locale, setLocale] = useState('ko');

  useEffect(() => {
    const cookieLocale = Cookies.get(localeKey);
    if (cookieLocale) {
      setLocale(cookieLocale);
    }
  }, []);

  return (
    <div>
      <Term locale={locale}/>
    </div>
  )
}