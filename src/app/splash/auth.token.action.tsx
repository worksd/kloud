'use server'
import { api } from "@/app/api.client";

export async function authToken() {
  const res = await api.auth.token({})
  if ('id' in res) {
    return {
      status: res.status
    }
  } else {
    return {
      code: res.code,
      errorTitle: res.message,
    }
  }
}