'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { userIdKey } from "@/shared/cookies.key";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";

export async function getUserAction(){
  const userId = (await cookies()).get(userIdKey)?.value;
  if (!userId) return null;

  return await api.user.get({id: Number(userId)});
}