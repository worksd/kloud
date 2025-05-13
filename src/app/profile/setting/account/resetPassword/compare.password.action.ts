'use server'

import { api } from "@/app/api.client";

export const checkPassword = async ({password}: {password: string}) => {
  const res = await api.auth.comparePassword({password})
  return res
}