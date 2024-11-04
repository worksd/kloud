import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { cookies } from "next/headers";
import { LoginForm } from "@/app/login/login.form";
import { redirect } from "next/navigation";
import { UserStatus } from "@/entities/user/user.status";
import { ExceptionResponseCode, GuinnessErrorCase } from "@/app/guinnessErrorCase";

export default function Login(props: any) {
  return (
    <>
      <LoginForm login={login}/>
    </>
  );
}

async function login(email: string, password: string): Promise<LoginActionResult> {
  'use server';
  try {
    console.log(`email: ${email} password: ${password}`);
    const res = await api.auth.email({
      email: email,
      password: password,
      type: UserType.Default,
    });
    if (!res.user) {
      return {
        errorMessage: (res as unknown as GuinnessErrorCase).message
      }
    }
    const nextCookies = cookies();
    nextCookies.set('accessToken', res.accessToken);
    nextCookies.set('userId', `${res.user.id}`);
    console.log(res.user.status);
    return {
      userStatus: res.user.status
    }
  } catch
    (e) {
    console.log(e)
    return {
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}

export interface LoginActionResult {
  errorMessage?: string,
  userStatus?: UserStatus,
}