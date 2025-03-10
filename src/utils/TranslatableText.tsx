'use client'
import { StringResource } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";
import { useEffect, useState } from "react";

interface TranslatableTextProps {
  className?: string;
  titleResource: keyof (typeof StringResource)["ko"];
  onClick?: () => void;
}

export const TranslatableText = ({className = '', titleResource, onClick}: TranslatableTextProps) => {
  const { t } = useLocale()
  const [ mounted, setMounted ] = useState(false);

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