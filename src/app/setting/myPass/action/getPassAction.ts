import { api } from "@/app/api.client";

export const getPassAction = async ({id}: { id: number }) => {
  return await api.pass.get({id})
}