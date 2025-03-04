import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { StringResource } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

export const useLocale = () => {
  const getInitialLocale = (): keyof typeof StringResource => {
    const cookieLang = Cookies.get(localeKey);
    return cookieLang && cookieLang in StringResource ? (cookieLang as keyof typeof StringResource) : "en";
  };

  const [locale, setLocale] = useState<keyof typeof StringResource>(getInitialLocale());

  useEffect(() => {
    if (!Cookies.get(localeKey)?.valueOf()) {
      Cookies.set(localeKey, locale, {expires: 360});
    }
  }, []);

  const changeLocale = (newLocale: keyof typeof StringResource) => {
    if (StringResource[newLocale]) {
      setLocale(newLocale);
      Cookies.set(localeKey, newLocale, {expires: 360});
    }
  };

  const t = <T extends keyof (typeof StringResource)["ko"]>(key: T): string => {
    return StringResource[locale]?.[key] || key;
  };

  return {t, locale, changeLocale};
};


