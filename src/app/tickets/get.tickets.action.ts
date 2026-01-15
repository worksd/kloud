'use server'

import { api } from "@/app/api.client";

export const getTicketsAction = async ({ page }: { page: number }) => {
  return await api.ticket.list({ page });
}
