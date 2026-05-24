'use client'

import { useEffect } from "react";
import { registerDeviceAction } from "@/app/home/action/register.device.action";

/**
 * /home 진입할 때마다 네이티브에 FCM 토큰을 요청.
 * 콜백으로 받은 토큰은 server action에서 기존 쿠키 값과 비교 →
 *   같으면 skip, 다르면 쿠키 갱신 + POST /devices 재호출.
 */
export const FcmTokenRequester = () => {
  useEffect(() => {
    window.onFcmTokenReceived = async (data: { fcmToken: string; udid: string }) => {
      await registerDeviceAction({ token: data.fcmToken, udid: data.udid });
    };

    if (typeof window.KloudEvent?.requestFcmToken === 'function') {
      window.KloudEvent.requestFcmToken();
    }
  }, []);

  return null;
};
