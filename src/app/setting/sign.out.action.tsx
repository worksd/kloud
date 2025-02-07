'use server'
import { api } from "@/app/api.client";

export const deleteUserAction = async ({reason} : {reason: string}) => {
  return await api.user.delete({ reason })
}