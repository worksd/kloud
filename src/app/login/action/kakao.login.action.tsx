'use server'

import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { RoutePageParams } from "@/app/login/action/google.login.action";

export const kakaoLoginAction = async ({code}: { code: string }): Promise<RoutePageParams> => {
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Kakao,
    token: code,
  })
  if ('accessToken' in res) {
    await loginSuccessAction({
      userId: res.user.id,
      accessToken: res.accessToken,
    })
    return {
      success: true,
      status: res.user.status,
    }
  } else {
    return {
      success: false,
      errorTitle: res.message,
    }
  }
}