'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { LoginActionResult } from "@/app/login/login.form";
import { z } from "zod";
import { loginSuccessAction } from "@/app/login/login.success.action";

const emailLoginAction = async (prev: LoginActionResult, formData: FormData): Promise<LoginActionResult> => {
  try {
    const getValidatedString = (data: unknown): string =>
      z.string().safeParse(data)?.data ?? '';

    const email = getValidatedString(formData.get('email'));
    const password = getValidatedString(formData.get('password'));
    console.log(email)
    console.log(password)
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });

    if ('user' in res) {
      loginSuccessAction({
        accessToken: res.accessToken,
        userId: res.user.id,
      })
      return {
        status: res.user.status,
        sequence: prev?.sequence + 1,
      };
    } else {
      return {
        sequence: prev.sequence + 1,
        errorCode: res.code,
        errorMessage: res.message
      }
    }
  } catch (e) {
    console.log(e)
    return {
      sequence: prev.sequence + 1,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}

export default emailLoginAction