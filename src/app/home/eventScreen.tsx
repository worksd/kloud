'use client'
import React, { useEffect, useRef, useState } from "react";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { DialogInfo } from "@/utils/dialog.factory";
import { GetHomeResponse } from "@/app/endpoint/home.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import { getHideDialogIdsAction } from "@/app/home/get.hide.dialog.ids.action";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";

/**
 * 첫번째 탭
 * @param os
 * @param data
 * @param hideDialogIds
 * @constructor
 */

export default function EventScreen({os, events, hideDialogIds: initialHideDialogIds}: { os: string, events: GetEventResponse[], hideDialogIds: number[] }) {
  const hasShownDialog = useRef(false);
  const [hideDialogIds, setHideDialogIds] = useState<number[]>(initialHideDialogIds);

  useEffect(() => {
    if (hasShownDialog.current) return;
    
    try {
      // 숨김 처리된 다이얼로그 제외
      const availableEvents = events.filter(event => !hideDialogIds.includes(event.id));
      
      if (availableEvents.length > 0) {
        hasShownDialog.current = true;
        const randomIndex = Math.floor(Math.random() * availableEvents.length);
        const event = availableEvents[randomIndex];
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
  }, [events, hideDialogIds]);

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
      // 숨김 처리 후 목록 업데이트
      if (data.clicked) {
        const updatedIds = await getHideDialogIdsAction();
        setHideDialogIds(updatedIds);
      } else {
        // 다시 보이게 한 경우 ID 제거
        const dialogId = parseInt(data.id, 10);
        setHideDialogIds(prev => prev.filter(id => id !== dialogId));
      }
    }
  }, [])

  return (
    <div/>
  );
}