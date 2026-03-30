'use server'

import { cookies } from "next/headers";
import { depositorKey } from "@/shared/cookies.key";

export const putDepositorNameAction = async ({depositor}: {depositor: string}) => {
  const cookieStore = await cookies();
  cookieStore.set(depositorKey, `${depositor}`,{
    maxAge: 15552000,
    sameSite: 'lax',
  })
}