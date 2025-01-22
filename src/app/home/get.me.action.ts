'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";

export const getMe = async () => {
  const res = await api.user.me({})
  if ('id' in res) {
    return res;
  }
  throw Error()
}