'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { RoutePageParams } from "@/app/login/action/google.login.action";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

const emailLoginAction = async ({email, password}: { email: string, password: string }): Promise<RoutePageParams> => {
  try {
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });

    if ('user' in res) {
      await loginSuccessAction({
        accessToken: res.accessToken,
        userId: res.user.id,
      })
      return {
        success: true,
        status: res.user.status,
      };
    } else {
      return {
        success: false,
        errorCode: res.code,
        errorMessage: res.message
      }
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}

export default emailLoginAction