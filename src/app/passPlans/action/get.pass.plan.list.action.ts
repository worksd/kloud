'use server'
import { api } from "@/app/api.client";

export const getPassPlanListAction = async ({studioId, withAll, status}: {studioId: number; withAll?: boolean; status?: string}) => {
  return await api.pass.listPlans({studioId, withAll, status})
}