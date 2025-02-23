'use server'
import { api } from "@/app/api.client";
import { GetStudioResult } from "@/app/home/@popularStudios/page";

export async function getStudioList(): Promise<GetStudioResult> {
  const res = await api.studio.list({});

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