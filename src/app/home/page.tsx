'use client'
import { useEffect } from "react";
import { getEventList } from "@/app/home/get.event.list.action";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";
import { hideDialogAction } from "@/app/home/hide.dialog.action";


export default function Home() {
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEventList();
        if (events.length > 0) {
          const randomIndex = Math.floor(Math.random() * events.length);
          const event = events[randomIndex];
          const dialogInfo = {
            id: event.id,
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
        console.error('이벤트 로딩 중 에러 발생:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    window.onDialogConfirm = async (data: GetEventResponse) => {
      if (data.route) {
        window.KloudEvent.push(data.route)
      }
    }
  }, [])

  useEffect(() => {
    window.onHideDialogConfirm = async ( data: { id: string, clicked: boolean}) => {
      await hideDialogAction({id: data.id, clicked: data.clicked})
    }
  })

  return <></>;
}