'use server'

import { LoginActionResult } from "@/app/login/login.form";
import { api } from "@/app/api.client";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { UserStatus } from "@/entities/user/user.status";
import { loginSuccessAction } from "@/app/login/login.success.action";

export const googleLoginAction = async ({code}: {code: string}): Promise<RoutePageParams> => {
  const res = await api.auth.socialLogin({
    provider: SnsProvider.Google,
    token: code,
  })
  if ('accessToken' in res) {
    await loginSuccessAction({
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

export interface RoutePageParams {
  status?: UserStatus,
  errorTitle ?: string,
  errorBody ?: string,
}