'use client'
import React, { useEffect } from "react";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { DialogInfo } from "@/utils/dialog.factory";
import { GetHomeResponse } from "@/app/endpoint/home.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";

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
          kloudNav.push(data.route)
        } else if (os === 'iOS') {
          kloudNav.rootNext(data.route)
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