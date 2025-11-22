'use server'
import {api} from "@/app/api.client";

export const getDynamicCommon = async ({path}: {path: string}) => {
  return await api.common.get({ path })
}