import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { cookies } from "next/headers";

export const loginSuccessAction = ({accessToken, userId}: {
  accessToken: string,
  userId: number,
}) => {
  const cookie = cookies()
  cookie.set(accessTokenKey, accessToken, {
    path: '/',
    maxAge: 2592000,
    sameSite: 'lax',
  })
  cookie.set(userIdKey, `${userId}`, {
    path: '/',
    maxAge: 2592000,
    sameSite: 'lax',
  })
  console.log(`cookie set accessToken = ${accessToken} userId = ${userId}`)
}