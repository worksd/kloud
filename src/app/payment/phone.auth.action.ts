'use server'

import { api } from "@/app/api.client";
import { loginSuccessAction } from "@/app/login/action/login.success.action";

// 결제 시트 내 폰 인증 — countryCode는 dial(예: '82')을 그대로 전달.
export const sendPaymentPhoneCodeAction = async ({ phone, countryCode }: { phone: string; countryCode: string }) => {
  return await api.auth.sendPhoneVerification({ phone, countryCode });
};

// 인증번호 확인 = 폰 로그인. 성공 시 accessToken/userID 쿠키 저장 후 응답 반환.
export const verifyPaymentPhoneLoginAction = async ({ code, phone, countryCode, name }: {
  code: string; phone: string; countryCode: string; name?: string;
}) => {
  const res = await api.auth.checkPhoneVerification({ code, phone, countryCode, isAdmin: false, name });
  if ('accessToken' in res && res.accessToken && 'user' in res) {
    await loginSuccessAction({ userId: res.user.id, accessToken: res.accessToken });
  }
  return res;
};
