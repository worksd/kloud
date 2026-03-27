'use client'

import { useEffect } from "react";
import { registerDeviceAction } from "@/app/home/action/register.device.action";

export const FcmTokenRequester = ({ hasFcmToken }: { hasFcmToken: boolean }) => {
  useEffect(() => {
    if (hasFcmToken) return;

    window.onFcmTokenReceived = async (data: { fcmToken: string; udid: string }) => {
      await registerDeviceAction({ token: data.fcmToken, udid: data.udid });
    };

    window.KloudEvent?.requestFcmToken();
  }, [hasFcmToken]);

  return null;
};
