'use server'
import { StudioGridItem } from "@/app/home/StudioGridItem";
import { translate } from "@/utils/translate";
import React from "react";
import Divider from "@/app/studios/[id]/studio.divider";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export const NoMyStudioPage = async ({studios}: {studios: GetStudioResponse[]}) => {
  return (
    <div className={'flex flex-col w-full max-w-screen overflow-x-hidden'}>

      <div className="w-full text-[#BCBFC2] mt-4 ml-6 mb-6 ">
        <p className="text-[18px] mb-2 text-black font-bold">{await translate('no_upcoming_lesson_title')}</p>
        <p className="text-sm text-gray-400">
          {await translate('no_upcoming_lesson_message')}
        </p>
      </div>

      <Divider/>

      <div
        className={'mt-6 px-6 text-[18px] font-bold text-black'}
        dangerouslySetInnerHTML={{__html: (await translate('studio_recommendation')).replace(/\n/g, '<br />')}}
      />
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-6 mt-4 pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
        {(studios ?? []).map((item) => (
          <StudioGridItem key={item.id} item={item}/>
        ))}
      </div>
    </div>
  )

}