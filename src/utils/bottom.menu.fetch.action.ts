'use client'

import { StringResource } from "@/shared/StringResource";

export function getBottomMenuList(locale: keyof typeof StringResource) {
  if (locale == "ko") return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST || "[]");
  else return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST_EN || "[]");
}