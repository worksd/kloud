'use server'
import { api } from "@/app/api.client";

export const getStudioInfoAction = async ({studioId}: { studioId: number }) => {
  return await api.studio.me({id: studioId})
}