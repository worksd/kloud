'use client'
import React, { useEffect } from "react";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { DialogInfo } from "@/utils/dialog.factory";
import { GetHomeResponse } from "@/app/endpoint/home.endpoint";

/**
 * 첫번째 탭
 * @param os
 * @param data
 * @constructor
 */

export default function HomeScreen({os, data}: { os: string, data: GetHomeResponse }) {
  useEffect(() => {
    try {
      if (data.events.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.events.length);
        const event = data.events[randomIndex];
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
  }, [data]);

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
