'use server'
import { api } from "@/app/api.client";

export async function checkDuplicateUser({nickName, phone}: { nickName?: string, phone?: string }) {
  return await api.user.checkDuplicate({nickName, phone})
}