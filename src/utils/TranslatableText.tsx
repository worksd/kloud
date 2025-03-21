'use client'
import { StringResource, StringResourceKey } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";
import { useEffect, useState } from "react";

interface TranslatableTextProps {
  className?: string;
  titleResource: StringResourceKey;
  onClick?: () => void;
}

export const TranslatableText = ({className = '', titleResource, onClick}: TranslatableTextProps) => {
  const {t} = useLocale()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`${className} whitespace-pre-line`} // whitespace-pre-line 추가
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