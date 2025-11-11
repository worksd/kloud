'use server'
import { api } from "@/app/api.client";
import { COUNTRIES } from "@/app/certification/COUNTRIES";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

export const checkVerificationCodeAction = async ({code, phone, countryCode, isAdmin}: {
  code: string,
  phone: string,
  countryCode: string,
  isAdmin: boolean,
}) => {
  const res = await api.auth.checkPhoneVerification({
    code,
    phone,
    countryCode: COUNTRIES.find((value) => value.key == countryCode)?.dial ?? '82',
    isAdmin,
  });
  if ('user' in res) {
    await loginSuccessAction({
      userId: res.user.id,
      accessToken: res.accessToken,
    })
  }
  return res;
}