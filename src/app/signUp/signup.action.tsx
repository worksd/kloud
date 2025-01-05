"use server";
import { z } from "zod";
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { SignUpActionResult } from "@/app/signUp/signup.form";

export const signUpAction = async (prev: SignUpActionResult, formData: FormData): Promise<SignUpActionResult> => {

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
    console.log('응답을 받았어!' + JSON.stringify(res))
    if ('user' in res) {
      return {
        sequence: prev.sequence + 1,
        accessToken: res.accessToken,
        userId: res.user.id,
      }
    }
    else {
      console.log('error return 가즈아!')
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