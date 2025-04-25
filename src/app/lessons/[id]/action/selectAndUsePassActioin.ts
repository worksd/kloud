'use server'
import { api } from "@/app/api.client";

export const selectAndUsePassActioin = async ({passId}: {passId: number}) => {
  const res = await api.pass.use({id: passId})
  return res;
}