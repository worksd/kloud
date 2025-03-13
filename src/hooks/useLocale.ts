import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { StringResource, type Locale, StringResourceKey } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

export const useLocale = () => {
  const getInitialLocale = (): Locale => {
    const cookieLang = Cookies.get(localeKey);
    return (cookieLang && cookieLang in StringResource.welcome) ?
      (cookieLang as Locale) : "ko";
  };

  const [locale, setLocale] = useState<Locale>(getInitialLocale());

  useEffect(() => {
    if (Cookies.get(localeKey)?.valueOf()) {
      setLocale(getInitialLocale());
    }
  }, []);

  const t = (key: StringResourceKey): string => {
    return StringResource[key]?.[locale] || key;
  };

  return { t, locale };
};