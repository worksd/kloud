'use client'
import { useEffect } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { hideDialogAction } from "@/app/home/hide.dialog.action";

export const TodayLessonWrapper = ({ticket}: { ticket: TicketResponse }) => {

  useEffect(() => {
    const dialogInfo = {
      id: `${ticket.id}`,
      route: `/tickets/${ticket.id}`,
      hideForeverMessage: '오늘 하루 보지 않기',
      imageUrl: ticket.lesson?.thumbnailUrl,
      imageRatio: 0.7,
      ctaButtonText: ticket.lesson?.title + ' 바로가기',
      type: 'IMAGE',
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }, [ticket.id, ticket.lesson?.thumbnailUrl, ticket.lesson?.title])

  useEffect(() => {
    window.onHideDialogConfirm = async (data: { id: string, clicked: boolean }) => {
      await hideDialogAction({id: data.id, clicked: data.clicked})
    }
  }, [])

  return (
    <div/>
  )
}