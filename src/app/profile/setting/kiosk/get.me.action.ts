import {api} from "@/app/api.client";

export const getMeAction = async () => {
  return await api.user.me({})
}