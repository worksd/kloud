'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { udidKey } from "@/shared/cookies.key";

export const registerDeviceAction = async ({token, udid}: {token: string, udid: string}) => {
  (await cookies()).set(udidKey, udid)
  return await api.device.register({token, udid});
}