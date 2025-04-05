'use server'

import { LessonBand } from "@/app/LessonBand";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import ArrowDownIcon from "../../../public/assets/arrow-down.svg"
import { PassColumnList } from "@/app/setting/myPass/PassColumnList";
import { PassBand } from "@/app/studios/PassBand";
import { translate } from "@/utils/translate";
import { AnnouncementBand } from "@/app/home/@my/announcement.band";

export default async function MyStudioPage({studioId}: { studioId?: string }) {
  console.log(`studioId = ${studioId}`)
  if (!studioId) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }
  const studio = await getStudioDetail(Number(studioId));
  if ('id' in studio) {
    return (
      <div className={'flex flex-col space-y-4 overflow-y-auto no-scrollbar'}>
        <NavigateClickWrapper method={'showBottomSheet'} route={KloudScreen.StudioSettingSheet}>
          <div
            className="bg-gray-100 rounded-lg p-4 mx-4 shadow-sm active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <CircleImage imageUrl={studio.profileImageUrl} size={60}/>
                <div className="text-lg font-bold text-black">{studio.name}</div>
              </div>
              <ArrowDownIcon/>
            </div>
          </div>

        </NavigateClickWrapper>
        <PassBand title={await translate('my_pass')} passes={studio.passes ?? []}/>
        {/*하드코딩 수정*/}
        <LessonBand title={`${studio.name} ${await translate('upcoming_lessons')}`} lessons={studio.lessons ?? []} type={'Default'}/>
        <LessonBand title={'하울 강사님이 추천하는 수업'} lessons={studio.lessons ?? []} type={'Recommend'}/>
        <LessonBand title={await translate('popular_lesson')} lessons={studio.lessons ?? []} type={'Default'}/>

      </div>
    )
  }
}