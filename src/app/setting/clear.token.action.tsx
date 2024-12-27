'use server'
import { cookies } from "next/headers";

export const clearToken =  async () => {
  const cookieStore = cookies()
  cookieStore.delete('accessToken')
  console.log(cookieStore.get('accessToken') + 'fuck!')
}