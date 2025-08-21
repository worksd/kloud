'use server'
import { api } from "@/app/api.client";
import { studioKey } from "@/shared/cookies.key";
import { cookies } from "next/headers";

export const getHomeAction = async () => {
  const studioId = (await cookies()).get(studioKey)?.value
  return api.home.getHome({
    studioId
  })
}