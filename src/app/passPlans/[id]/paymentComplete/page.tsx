import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { Props } from "@/app/studios/[id]/page";
import { extractNumber } from "@/utils";
import LargeCircleCheckIcon from "../../../../../public/assets/ic_large_circle_check.svg"
import { LessonBand } from "@/app/LessonBand";
import { getPassAction } from "@/app/setting/myPass/action/getPassAction";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";

export default async function PassPaymentCompletePage({params}: Props) {
  const res = await getPassAction({id: extractNumber((await params).id)})
  if ('id' in res) {
    const studio = await getStudioDetail(res.passPlan?.studio?.id ?? 0)
    if ('id' in studio) {
      return (
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
          <div className="flex justify-between items-center">
            <SimpleHeader titleResource={undefined}/>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 w-full">
            <LargeCircleCheckIcon/>
            <div className="text-black text-[24px] font-medium">{res.passPlan?.name} 패스 구매를 완료했어요!</div>
            <div className="text-[16px] text-black">{studio.name} 스튜디오의 수업을 신청해보세요</div>

            {'id' in studio && (
              <div className="w-full mt-4">
                <LessonBand lessons={studio.lessons} title={''}/>
              </div>
            )}
          </div>
        </div>
      )
    }
  }
}