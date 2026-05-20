'use client'

import { useEffect } from "react";
import { HomeAlertResponse } from "@/app/endpoint/home.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

/**
 * 홈 alert 다이얼로그.
 *
 * 이전엔 createDialog(server action) 호출 → Next.js가 RSC invalidate → home 무한 재페치되는 문제.
 * 다이얼로그 객체를 client에서 직접 build해서 server action 호출 자체를 제거.
 */
export const HomeAlerts = ({ alerts, locale }: { alerts: HomeAlertResponse[]; locale: Locale }) => {
  useEffect(() => {
    if (alerts.length === 0) return;

    const alert = alerts[0];
    const dialog = {
      id: 'HomeAlert',
      type: 'YESORNO',
      title: alert.title,
      message: alert.description,
      confirmTitle: getLocaleString({ locale, key: 'confirm' }),
      cancelTitle: getLocaleString({ locale, key: 'cancel' }),
      route: alert.route,
    };
    window.KloudEvent?.showDialog(JSON.stringify(dialog));
  }, [alerts, locale]);

  return null;
};
