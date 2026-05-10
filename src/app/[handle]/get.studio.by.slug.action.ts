'use server'

import { api } from "@/app/api.client";

export async function getStudioBySlugAction(slug: string) {
  return await api.studio.getBySlug({ slug });
}
