import { api } from "@/app/api.client";

export const getMembershipAction = async ({id}: { id: number }) => {
  return await api.membership.get({id})
}

