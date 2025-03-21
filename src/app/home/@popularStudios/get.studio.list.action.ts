'use server'
import { api } from "@/app/api.client";
import { GetStudioResult } from "@/app/home/@popularStudios/page";

export async function getStudioList({hasPass}: { hasPass?: boolean }): Promise<GetStudioResult> {
  const res = await api.studio.list({hasPass: hasPass ?? false});

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