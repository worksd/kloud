'use server'

import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { RoutePageParams } from "@/app/login/action/google.login.action";

export const appleLoginAction = async ({code}: { code: string }): Promise<RoutePageParams> => {
  console.log(code)
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Apple,
    token: code,
  })
  console.log(res)
  if ('accessToken' in res) {
    loginSuccessAction({
      userId: res.user.id,
      accessToken: res.accessToken,
    })
    return {
      status: res.user.status,
    }
  } else {
    return {
      errorTitle: res.message,
    }
  }
}