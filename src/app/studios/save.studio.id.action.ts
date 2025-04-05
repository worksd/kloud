'use server'
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

export const saveStudioIdAction = async ({studioId}: { studioId?: number }) => {
  const cookieStore = await cookies();
  cookieStore.set(studioKey, `${studioId}`,{
    maxAge: 2592000,
    sameSite: 'lax',
  })
};