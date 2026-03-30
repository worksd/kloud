'use server'
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { cookies } from "next/headers";

export const loginSuccessAction = async ({accessToken, userId}: {
  accessToken: string,
  userId: number,
}) => {
  const cookie = await cookies()
  cookie.set(accessTokenKey, accessToken, {
    maxAge: 15552000,
    sameSite: 'lax',
  })
  cookie.set(userIdKey, `${userId}`, {
    maxAge: 15552000,
    sameSite: 'lax',
  })
}