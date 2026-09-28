'use server'

import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { SnsProvider } from "@/app/endpoint/auth.endpoint";
import { UserStatus } from "@/entities/user/user.status";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

export const googleLoginAction = async ({code}: { code: string }): Promise<RoutePageParams> => {
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
      success: true,
      status: res.user.status,
      type: res.user.type,
    }
  } else {
    return {
      success: false,
      errorCode: res.code,
      errorMessage: res.message,
    }
  }
}

export interface RoutePageParams {
  success: boolean,
  status?: UserStatus,
  /** 관리자(Partner/Operator) 여부 판단용 — 로그인 직후 관리자 홈 분기에 쓴다 */
  type?: UserType,
  errorCode?: string,
  errorMessage?: string,
}