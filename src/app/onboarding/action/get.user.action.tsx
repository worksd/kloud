'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

export async function getUserAction(): Promise<GetUserResponse | null> {
  try {
    const userId = (await cookies()).get(userIdKey)?.value;

    if (!userId) {
      return null;
    }

    const user = await api.user.get({
      id: Number(userId)
    });
    if ('id' in user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}