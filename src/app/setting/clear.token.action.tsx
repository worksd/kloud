'use server'
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";

export const clearToken =  async () => {
  const cookieStore = cookies()
  cookieStore.delete(accessTokenKey)
  cookieStore.delete(userIdKey)
  console.log(cookieStore.get(accessTokenKey)?.value + 'fuck!')
}