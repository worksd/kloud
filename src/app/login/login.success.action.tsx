import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { UserStatus } from "@/entities/user/user.status";
import { authNavigateAction } from "@/app/splash/auth.navigate.action";
import { cookies } from "next/headers";

export const loginSuccessAction = ({accessToken, userId, status}: {
  accessToken: string,
  userId: number,
  status: UserStatus,
}) => {
  const cookie = cookies()
  cookie.set(accessTokenKey, accessToken)
  cookie.set(userIdKey, `${userId}`)
  return authNavigateAction({status: status})
}