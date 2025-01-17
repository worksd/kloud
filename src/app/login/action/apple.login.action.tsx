'use server'

import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { loginSuccessAction } from "@/app/login/login.success.action";

export const appleLoginAction = async ({code}: { code: string }): Promise<string> => {
  console.log(code)
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Apple,
    token: code,
  })
  console.log(res)
  if ('accessToken' in res) {
    return loginSuccessAction({
      status: res.user.status,
      userId: res.user.id,
      accessToken: res.accessToken,
    })
  } else {
    throw Error()
  }
}