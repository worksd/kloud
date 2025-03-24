'use server'

import { api } from "@/app/api.client";
import { extractNumber } from "@/utils";

export async function getStudioDetail(id: number) {
  return await api.studio.get({id: id});
}