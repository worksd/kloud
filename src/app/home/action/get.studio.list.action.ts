'use server'
import { api } from "@/app/api.client";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export async function getStudioList({hasPass}: { hasPass?: boolean }): Promise<{studios?: GetStudioResponse[], errorMessage?: string}> {
  const res = await api.studio.list({hasPass: hasPass});

  if ('studios' in res) {
    return {
      studios: res.studios
    }
  } else {
    return {
      errorMessage: res.message,
    }
  }
}