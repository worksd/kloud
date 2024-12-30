'use server'
import { z } from "zod";
import { api } from "@/app/api.client";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { UserType } from "@/entities/user/user.type";

export const onboardAction = async (prev: OnboardActionResult, formData: FormData): Promise<OnboardActionResult> => {

  try {
    const getValidatedString = (data: unknown): string =>
      z.string().safeParse(data)?.data ?? '';

    const name = getValidatedString(formData.get('name'));
    console.log('가즈아잇!' + '헤헤 ' + name + ' ' + cookies().get(userIdKey)?.value)
    const userId = Number(cookies().get(userIdKey)?.value)
    if (isNaN(userId)) throw Error('User Id가 없습니다' + userId)
    const res = await api.user.update({
      name: name,
      id: userId,
      type: UserType.Default,
    });
    console.log(res)
    if ('user' in res) {
      return {
        success: true,
        sequence: prev.sequence + 1,
      }
    } else {
      console.log('error return 가즈아!')
      return {
        success: true,
        sequence: prev.sequence + 1,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      sequence: prev.sequence + 1,
      errorMessage: ExceptionResponseCode.UNKNOWN_ERROR
    }
  }
}

export interface OnboardActionResult {
  success: boolean;
  sequence: number;
  errorCode?: string;
  errorMessage?: string;
}