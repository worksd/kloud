'use client'
import { Locale, StringResource, StringResourceKey } from "@/shared/StringResource";

export const getLocaleString = ({locale, key}: { locale: Locale, key: StringResourceKey }): string => {
  return StringResource[key]?.[locale] || key;
}