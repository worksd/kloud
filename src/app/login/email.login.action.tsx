'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { LoginActionResult } from "@/app/login/login.form";
import { loginSuccessAction } from "@/app/login/login.success.action";

const emailLoginAction = async ({email, password}: { email: string, password: string }): Promise<LoginActionResult> => {
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
        status: res.user.status,
        sequence: 1,
      };
    } else {
      return {
        sequence: 1,
        errorCode: res.code,
        errorMessage: res.message
      }
    }
  } catch (e) {
    console.log(e)
    return {
      sequence: 1,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}

export default emailLoginAction