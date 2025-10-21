'use server'

// 사용 예시
import { api } from "@/app/api.client";

export const sendVerificationSMS = async ({phone, countryCode}: { phone: string, countryCode: string }) => {
  await api.auth.sendPhoneVerification({phone, countryCode});
};