'use server'
import { api } from "@/app/api.client";

export async function checkDuplicateNickName({nickName}: {nickName: string}) {
  return api.user.checkDuplicate({nickName})
}