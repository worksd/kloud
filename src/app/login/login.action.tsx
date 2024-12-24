'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode, GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { LoginActionResult } from "@/app/login/login.form";
import { z } from "zod";

export const loginAction = async (prev: LoginActionResult, formData: FormData): Promise<LoginActionResult> => {

  try {
    const getValidatedString = (data: unknown): string =>
      z.string().safeParse(data)?.data ?? '';

    // const email = getValidatedString(formData.get('email'));
    // const password = getValidatedString(formData.get('password'));
    const email = 'dongho123@unist.ac.kr'
    const password = 'gusgh0705!'
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });
    if ('user' in res) {
      const nextCookies = cookies();
      nextCookies.set(accessTokenKey, res.accessToken);
      nextCookies.set(userIdKey, `${res.user.id}`);
      return {
        sequence: prev.sequence + 1,
        accessToken: res.accessToken,
        userStatus: res.user.status
      }
    }
    else {
      return {
        sequence: prev.sequence + 1,
        errorMessage: res.message
      }
    }
  } catch
    (e) {
    console.log(e)
    return {
      sequence: prev.sequence + 1,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}