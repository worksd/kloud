import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { api } from "@/app/api.client";
import { Props } from "@/app/studios/[id]/page";
import { extractNumber } from "@/utils";
import LargeCircleCheckIcon from "../../../../../public/assets/ic_large_circle_check.svg"
import { LessonBand } from "@/app/LessonBand";

export default async function PassPaymentCompletePage({params}: Props) {
  const studio = await api.studio.get({id: extractNumber((await params).id)})
  const res = await api.lesson.listStudioLessons({studioId: (await params).id})
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <div className="flex justify-between items-center">
        <SimpleHeader titleResource={undefined}/>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full">
        <LargeCircleCheckIcon/>
        <div className="text-black text-[24px] font-medium">패스 구매를 완료했어요!</div>
        <div className="text-[16px] text-black">프레베리 댄스 스튜디오의 수업을 신청해보세요</div>

        {'lessons' in res && (
          <div className="w-full mt-4">
            <LessonBand lessons={res.lessons} title={''}/>
          </div>
        )}
      </div>
    </div>
  )
}