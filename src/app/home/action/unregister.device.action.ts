'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { udidKey } from "@/shared/cookies.key";

export const unregisterDeviceAction = async () => {
  const deviceId = (await cookies()).get(udidKey)?.value
  if (deviceId) {
    return await api.device.unregister({
      udid: deviceId
    })
  } else {
    console.log(`deviceId not found`)
  }
}