'use server'
import { api } from "@/app/api.client";

export const getPassPlanListAction = async ({studioId}: {studioId: number}) => {
  return await api.pass.listPlans({studioId})
}