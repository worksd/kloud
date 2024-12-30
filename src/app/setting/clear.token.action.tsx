'use server'
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";

export const clearToken =  async () => {
  const cookieStore = cookies()
  cookieStore.delete(accessTokenKey)
  console.log(cookieStore.get(accessTokenKey)?.value + 'fuck!')
}