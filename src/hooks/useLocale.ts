"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { StringResource } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

export const useLocale = () => {
  // 초기 언어 가져오기 (쿠키 우선, 없으면 기본값 "en")
  // TODO: 하드코딩 제거
  // const getInitialLocale = (): keyof typeof StringResource => {
  //   const cookieLang = Cookies.get(localeKey);
  //   return cookieLang && cookieLang in StringResource ? (cookieLang as keyof typeof StringResource) : "en";
  // };

  const [locale, setLocale] = useState<keyof typeof StringResource>('ko');

  useEffect(() => {
    // Cookies.set(localeKey, locale, { expires: 360 }); // 쿠키 360일 유지
  }, [locale]);

  const changeLocale = (newLocale: keyof typeof StringResource) => {
    // if (StringResource[newLocale]) {
    //   setLocale(newLocale);
    //   Cookies.set(localeKey, newLocale, { expires: 360 }); // 쿠키 업데이트
    // }
  };

  const t = (key: keyof (typeof StringResource)["ko"]) =>
    StringResource[locale]?.[key] || key; // 안전한 접근

  return { t, locale, changeLocale };
};
