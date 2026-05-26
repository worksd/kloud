'use server'

import { api } from "@/app/api.client";

export const getMeBirthAction = async (): Promise<string | null> => {
  const res = await api.user.me({})
  if ('id' in res && res.birth) {
    return res.birth
  }
  return null
}
