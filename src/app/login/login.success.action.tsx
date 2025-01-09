import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { UserStatus } from "@/entities/user/user.status";
import { authNavigateAction } from "@/app/splash/auth.navigate.action";

export const loginSuccessAction = ({accessToken, userId, status}: {
  accessToken: string,
  userId: number,
  status: UserStatus,
}) => {
  document.cookie = `${accessTokenKey}=${accessToken};path=/; max-age=2592000; SameSite=Lax`;
  document.cookie = `${userIdKey}=${userId};path=/; max-age=2592000; SameSite=Lax`;
  return authNavigateAction({status: status})
}