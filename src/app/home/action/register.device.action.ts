'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { fcmTokenKey, udidKey } from "@/shared/cookies.key";

export const registerDeviceAction = async ({token, udid}: {token: string, udid: string}) => {
  const cookieStore = await cookies();
  cookieStore.set(udidKey, udid);
  cookieStore.set(fcmTokenKey, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
  return await api.device.register({token, udid});
}