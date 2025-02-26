'use server'
import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { udidKey } from "@/shared/cookies.key";

export const unregisterDeviceAction = async () => {
    return await api.device.unregister({})
}