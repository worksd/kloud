'use server'
import { api } from "@/app/api.client";

export const getMembershipPlanListAction = async ({studioId}: {studioId?: number}) => {
  return await api.membership.listPlans({studioId})
}

