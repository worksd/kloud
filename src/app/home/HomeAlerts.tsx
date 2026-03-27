'use client'

import { useEffect } from "react";
import { HomeAlertResponse } from "@/app/endpoint/home.endpoint";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";

export const HomeAlerts = ({ alerts }: { alerts: HomeAlertResponse[] }) => {
  useEffect(() => {
    if (alerts.length === 0) return;

    const showAlert = async () => {
      const alert = alerts[0];
      const dialog = await createDialog({
        id: 'HomeAlert',
        title: alert.title,
        message: alert.description,
      });
      if (dialog) {
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    };

    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id === 'HomeAlert') {
        const alert = alerts[0];
        if (alert?.route) {
          await kloudNav.push(alert.route);
        }
      }
    };

    showAlert();
  }, [alerts]);

  return null;
};
