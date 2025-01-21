"use server";
import { z } from "zod";
import { api } from "@/app/api.client";
import { UserType } from "@/entities/user/user.type";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { loginSuccessAction } from "@/app/login/login.success.action";
import { RoutePageParams } from "@/app/login/action/google.login.action";

export const signUpAction = async ({ email, password } : {email: string, password: string}): Promise<RoutePageParams> => {

  try {
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
        success: true,
        status: res.user.status,
      };
    } else {
      return {
        success: false,
        errorCode: res.code,
        errorTitle: res.message
      }
    }
  } catch (e) {
    return {
      success:false,
      errorTitle: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}