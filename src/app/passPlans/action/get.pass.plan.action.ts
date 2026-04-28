'use server'
import { api } from "@/app/api.client";

export const getPassPlanAction = async ({ id }: { id: number }) => {
  return await api.pass.getPlan({ id });
};
