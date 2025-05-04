'use client'
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { useEffect } from "react";

export const TodayLessonWrapper = ({lesson}: { lesson: GetLessonResponse }) => {

  //TODO: 테스트 데이터 지우기
  useEffect(() => {
    const dialogInfo = {
      id: '',
      route: '',
      hideForeverMessage: '',
      imageUrl: lesson.thumbnailUrl,
      imageRatio: 0.7,
      ctaButtonText: lesson.title + ' 바로가기',
      type: 'IMAGE',
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }, [lesson.thumbnailUrl, lesson.title])

  return (
    <div/>
  )
}