'use client'
import React, { useEffect } from "react";
import { getEventList } from "@/app/home/get.event.list.action";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { registerDeviceAction } from "@/app/home/action/register.device.action";
import { DialogInfo } from "@/utils/dialog.factory";

export default function HomeScreen({os}: { os: string }) {
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEventList();
        if (events.length > 0) {
          const randomIndex = Math.floor(Math.random() * events.length);
          const event = events[randomIndex];
          const dialogInfo = {
            id: `${event.id}`,
            route: event.route,
            hideForeverMessage: event.hideForeverMessage,
            imageUrl: event.imageUrl,
            imageRatio: event.imageRatio,
            ctaButtonText: event.ctaButtonText,
            type: 'IMAGE',
          }
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
        }
      } catch (error) {
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.route) {
        if (os === 'Android') {
          window.KloudEvent.push(data.route)
        } else if (os === 'iOS') {
          window.KloudEvent.rootNext(data.route)
        }
      }
    }
  }, [])

  useEffect(() => {
    window.onHideDialogConfirm = async (data: { id: string, clicked: boolean }) => {
      await hideDialogAction({id: data.id, clicked: data.clicked})
    }
  }, [])

  useEffect(() => {
    window.onFcmTokenComplete = async (data: { fcmToken: string, udid: string }) => {
      await registerDeviceAction({
        token: data.fcmToken,
        udid: data.udid ?? generateRandomString(),
      })
    }
  }, [])

  useEffect(() => {
    window.KloudEvent?.registerDevice()
  }, [])

  return (
    <div/>
  );
}

function generateRandomString(length: number = 15): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIdx = Math.floor(Math.random() * chars.length);
    result += chars[randomIdx];
  }
  return result;
}
