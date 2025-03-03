'use client'
import { StringResource } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";

interface TopToolbarProps {
  title: keyof (typeof StringResource)["ko"];
}

export function TopToolbar({ title }: TopToolbarProps) {
  const { t } = useLocale()
  return (
    <header className="p-4">
      <h1 className="w-screen text-[24px] font-normal text-black">{t(title)}</h1>
    </header>
  );
} 