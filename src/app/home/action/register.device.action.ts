'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { fcmTokenKey, udidKey } from "@/shared/cookies.key";

/**
 * 네이티브에서 받은 FCM 토큰을 기존 쿠키 값과 비교.
 * 같으면 skip(쿠키 갱신/POST 둘 다 X) — /home 진입마다 매번 호출돼서 BE 부담 줄임.
 * 다르면 쿠키 갱신 + POST /devices.
 */
export const registerDeviceAction = async ({token, udid}: {token: string, udid: string}) => {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(fcmTokenKey)?.value;
  if (existingToken === token) {
    return { success: true, skipped: true };
  }

  cookieStore.set(udidKey, udid);
  cookieStore.set(fcmTokenKey, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
  return await api.device.register({token, udid});
}