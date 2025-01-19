"use server";
import { z } from "zod";
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { LoginActionResult } from "@/app/login/login.form";

export const signUpAction = async (prev: LoginActionResult, formData: FormData): Promise<LoginActionResult> => {

  try {
    const getValidatedString = (data: unknown): string =>
      z.string().safeParse(data)?.data ?? '';

    const email = getValidatedString(formData.get('email'));
    const password = getValidatedString(formData.get('password'));
    const res = await api.auth.signUp({
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
    return {
      sequence: prev.sequence + 1,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}