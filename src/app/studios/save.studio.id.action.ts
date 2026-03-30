'use server'
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";

export const saveStudioIdAction = async ({studioId}: { studioId?: number }) => {
  const cookieStore = await cookies();
  cookieStore.set(studioKey, `${studioId}`,{
    maxAge: 15552000,
    sameSite: 'lax',
  })
};

export const clearStudioIdAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(studioKey);
};