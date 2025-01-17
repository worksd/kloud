'use server'

import { LoginActionResult } from "@/app/login/login.form";
import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { UserStatus } from "@/entities/user/user.status";
import { loginSuccessAction } from "@/app/login/login.success.action";

export const googleLoginAction = async ({code}: {code: string}): Promise<string> => {
  console.log(code)
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Google,
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