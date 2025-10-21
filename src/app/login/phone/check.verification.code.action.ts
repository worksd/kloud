'use server'
import { api } from "@/app/api.client";

export const checkVerificationCodeAction = async ({code}: { code: string }) => {
  return await api.auth.checkPhoneVerification({code});
}