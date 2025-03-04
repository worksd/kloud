'use server'

import { cookies } from "next/headers";
import { localeKey } from "@/shared/cookies.key";

export async function getBottomMenuList() {
  const locale = (await cookies()).get(localeKey)?.value ?? 'ko'
  if (locale == "ko") return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST || "[]");
  else return JSON.parse(process.env.NEXT_PUBLIC_BOTTOM_MENU_LIST_EN || "[]");
}