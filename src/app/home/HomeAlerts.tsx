'use client'

import { useEffect } from "react";
import { HomeAlertResponse } from "@/app/endpoint/home.endpoint";
import { createDialog } from "@/utils/dialog.factory";

export const HomeAlerts = ({ alerts }: { alerts: HomeAlertResponse[] }) => {
  useEffect(() => {
    if (alerts.length === 0) return;

    const showAlert = async () => {
      const alert = alerts[0];
      const dialog = await createDialog({
        id: 'HomeAlert',
        title: alert.title,
        message: alert.description,
        customData: alert.route,
      });
      if (dialog) {
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    };

    showAlert();
  }, [alerts]);

  return null;
};
