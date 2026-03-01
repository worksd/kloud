'use server'

// 사용 예시
import { api } from "@/app/api.client";
import { COUNTRIES } from "@/app/certification/COUNTRIES";

export const sendVerificationSMS = async ({phone, countryCode}: {
  phone: string,
  countryCode: string,
}): Promise<{ ttl: number; resendAvailableAt?: string } | { message: string }> => {
  const res = await api.auth.sendPhoneVerification({
    phone,
    countryCode: COUNTRIES.find((value) => value.key == countryCode)?.dial ?? '82',
  });
  if ('ttl' in res) {
    return { ttl: res.ttl, resendAvailableAt: res.resendAvailableAt };
  }
  return res as { message: string };
};