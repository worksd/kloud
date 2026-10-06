'use server'

import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { RoutePageParams } from "@/app/login/action/google.login.action";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

export const kakaoLoginAction = async ({code, token}: { code?: string, token?: string }): Promise<RoutePageParams> => {
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Kakao,
    token: token,
    code: code,
  })
  if ('accessToken' in res) {
    await loginSuccessAction({
      userId: res.user.id,
      accessToken: res.accessToken,
    })
    return {
      success: true,
      status: res.user.status,
      type: res.user.type,
    }
  } else {
    return {
      success: false,
      errorMessage: res.message,
      errorCode: res.code,
    }
  }
}