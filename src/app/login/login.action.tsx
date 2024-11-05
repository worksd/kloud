'use server';
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode, GuinnessErrorCase } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";
import { LoginActionResult } from "@/app/login/login.form";

export const loginAction = async (prev: LoginActionResult, formData: FormData): Promise<LoginActionResult> => {

  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });
    console.log(`email: ${email} password: ${password} res = ${JSON.stringify(res)}`);
    if (!res.user) {
      const errorMessage = (res as unknown as GuinnessErrorCase).message
      return {
        sequence: prev.sequence + 1,
        errorMessage
      }
    }
    const nextCookies = cookies();
    nextCookies.set(accessTokenKey, res.accessToken);
    nextCookies.set(userIdKey, `${res.user.id}`);
    return {
      sequence: prev.sequence + 1,
      accessToken: res.accessToken,
      userStatus: res.user.status
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