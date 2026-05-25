'use client'
import React, { useEffect, useRef, useState } from "react";
import { setHideDialogCookie } from "@/app/home/hide.dialog.cookie";
import { DialogInfo } from "@/utils/dialog.factory";
import { GetHomeResponse } from "@/app/endpoint/home.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import {GetEventResponse} from "@/app/endpoint/event.endpoint";

/**
 * 첫번째 탭
 * @param os
 * @param data
 * @param hideDialogIds
 * @constructor
 */

export default function EventScreen({os, events, hideDialogIds: initialHideDialogIds, hideForeverMessage}: { os: string, events: GetEventResponse[], hideDialogIds: number[], hideForeverMessage: string }) {
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
          // BE 응답값 무시하고 클라가 locale에 맞춰 박음 — 토글 ON 시 hideDialogIdList 쿠키에 event.id 누적 저장
          hideForeverMessage,
          imageUrl: event.imageUrl,
          // BE가 imageRatio를 내려보내지 않아 클라에서 0.8 고정으로 박음.
          imageRatio: 0.8,
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
        await kloudNav.push(data.route)
      }
    }
  }, [])

  useEffect(() => {
    window.onHideDialogConfirm = async (data: { id: string, clicked: boolean }) => {
      // 쿠키는 client에서 직접 set — server action 호출 시 Next.js가 RSC를 invalidate해 home 전체가 재페치되는 부작용 회피.
      setHideDialogCookie(data.id, data.clicked);
      const dialogId = parseInt(data.id, 10);
      if (!Number.isFinite(dialogId)) return;
      if (data.clicked) {
        setHideDialogIds(prev => prev.includes(dialogId) ? prev : [...prev, dialogId]);
      } else {
        setHideDialogIds(prev => prev.filter(id => id !== dialogId));
      }
    }
  }, [])

  return (
    <div/>
  );
}