'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode, GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { LoginActionResult } from "@/app/login/login.form";
import { z } from "zod";

const loginAction = async (prev: LoginActionResult, formData: FormData): Promise<LoginActionResult> => {

  try {
    const getValidatedString = (data: unknown): string =>
      z.string().safeParse(data)?.data ?? '';

    const email = getValidatedString(formData.get('email'));
    const password = getValidatedString(formData.get('password'));
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });

    if ('user' in res) {
      const nextCookies = cookies()
      // nextCookies.set(accessTokenKey, res.accessToken)
      // nextCookies.set(userIdKey, `${res.user.id}`)
      const result: LoginActionResult = {
        sequence: prev?.sequence + 1,
        accessToken: res.accessToken,
        userStatus: res.user.status,
        userId: res.user.id,
      };

      console.log('로그인 성공 결과:', result);
      return result;
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

export default loginAction