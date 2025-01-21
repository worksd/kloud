'use server'
import { api } from "@/app/api.client";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { UserType } from "@/entities/user/user.type";
import { RoutePageParams } from "@/app/login/action/google.login.action";
import { UserStatus } from "@/entities/user/user.status";

export const onboardAction = async ({name}: { name: string }): Promise<RoutePageParams> => {

  try {
    const userId = Number((await cookies()).get(userIdKey)?.value)
    if (isNaN(userId)) throw Error('User Id가 없습니다' + userId)
    const res = await api.user.update({
      name: name,
      id: userId,
      type: UserType.Default,
    });
    if ('id' in res) {
      return {
        success: true,
        status: UserStatus.Ready,
      }
    } else {
      return {
        success: false,
        errorCode: res.code,
        errorTitle: res.message,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      errorCode: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}