'use server'

import { getLocale } from "@/utils/translate";

export async function getBottomMenuList() {
  const locale = await getLocale();
  if (locale == "ko") return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST || "[]");
  else if (locale == 'jp') return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST_JP || "[]");
  else return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST_EN || "[]");
}