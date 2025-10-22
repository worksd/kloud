'use server'
import { api } from "@/app/api.client";
import { COUNTRIES } from "@/app/certification/COUNTRIES";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

export const checkVerificationCodeAction = async ({code, phone, countryCode}: {
  code: string,
  phone: string,
  countryCode: string
}) => {
  const res = await api.auth.checkPhoneVerification({
    code,
    phone,
    countryCode: COUNTRIES.find((value) => value.key == countryCode)?.dial ?? '82'
  });
  if ('user' in res) {
    await loginSuccessAction({
      userId: res.user.id,
      accessToken: res.accessToken,
    })
  }
  return res;
}