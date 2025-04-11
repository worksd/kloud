'use server'
import { api } from "@/app/api.client";

export const sendVerificationEmailAction = async () => {
  return await api.auth.sendEmailVerification({})
}