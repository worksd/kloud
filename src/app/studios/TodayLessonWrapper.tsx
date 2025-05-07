'use client'
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { useEffect } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

export const TodayLessonWrapper = ({ticket}: { ticket: TicketResponse }) => {

  //TODO: 테스트 데이터 지우기
  useEffect(() => {
    const dialogInfo = {
      id: 'TodayClass',
      route: `/tickets/${ticket.id}`,
      hideForeverMessage: '오늘 하루 보지 않기',
      imageUrl: ticket.lesson?.thumbnailUrl,
      imageRatio: 0.7,
      ctaButtonText: ticket.lesson?.title + ' 바로가기',
      type: 'IMAGE',
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }, [ticket.id, ticket.lesson?.thumbnailUrl, ticket.lesson?.title])

  return (
    <div/>
  )
}