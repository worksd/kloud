'use server'

import { LessonBand } from "@/app/LessonBand";
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import ArrowRightIcon from "../../../public/assets/gray_right_arrow.svg"
import { PassBand } from "@/app/studios/PassBand";
import { translate } from "@/utils/translate";
import { getStudioInfoAction } from "@/app/studios/getStudioInfoAction";

export default async function MyStudioPage({studioId}: { studioId?: string }) {
  console.log(`studioId = ${studioId}`)
  if (!studioId) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }
  const res = await getStudioInfoAction({studioId: Number(studioId)});
  if ('studio' in res) {
    return (
      <div className={'flex flex-col space-y-4 overflow-y-auto no-scrollbar pb-10'}>
        <div className={'mb-5'}>
          <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(res.studio.id)}>
            <div
              className="bg-gray-100 rounded-[16px] p-4 mx-4 shadow-sm active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center space-x-4">
                  <CircleImage imageUrl={res.studio.profileImageUrl} size={28}/>
                  <div className="text-lg font-bold text-black">{res.studio.name}</div>
                </div>
                <ArrowRightIcon/>
              </div>
            </div>
          </NavigateClickWrapper>
        </div>
        {res.bands.map((value) => (
          <LessonBand
            key={value.title}
            title={value.title}
            lessons={value.lessons}
            type={value.type}
          />
        ))}
        <PassBand title={await translate('my_pass')} passes={res.passes ?? []}/>

      </div>
    )
  }
}