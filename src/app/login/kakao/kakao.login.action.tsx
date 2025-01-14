'use server'

import { LoginActionResult } from "@/app/login/login.form";

export const KakaoLoginAction = async ({code}: {code: string}): Promise<LoginActionResult> => {
  return {
    sequence: 1,
  }
}