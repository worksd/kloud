'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

export async function getUserAction(): Promise<GetUserResponse | null> {
  const userId = (await cookies()).get(userIdKey)?.value;
  if (!userId) return null;

  try {
    const user = await api.user.get({ id: Number(userId) });
    return 'id' in user ? user : null;
  } catch {
    return null;
  }
}