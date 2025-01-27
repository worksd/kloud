'use server'
import { api } from "@/app/api.client";

export const deleteUserAction = async () => {
  try {
    await api.user.delete({})
  } catch (e) {
    console.log(e)
  }
}