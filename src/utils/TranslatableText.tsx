'use client'
import { type Locale, StringResource } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { localeKey } from "@/shared/cookies.key";

interface TranslatableTextProps {
  className?: string;
  titleResource: keyof typeof StringResource;
  onClick?: () => void;
}

export const TranslatableText = ({className = '', titleResource, onClick}: TranslatableTextProps) => {
  const {t} = useLocale()
  const [mounted, setMounted] = useState(false);
  const locale = Cookies.get(localeKey)?.valueOf();

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`${className}`}
      onClick={onClick}
    >
      {mounted ? t(titleResource) : ''}
    </div>
  )
}

export function getTranslatedText({
                                    titleResource,
                                    text,
                                    mounted
                                  }: {
  titleResource: keyof typeof StringResource,
  text: string,
  mounted: boolean
}): string {
  return mounted ? text : ''
}