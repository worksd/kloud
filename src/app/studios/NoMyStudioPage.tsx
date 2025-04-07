'use server'
import { StudioItem } from "@/app/search/StudioItem";
import { getStudioList } from "@/app/home/action/get.studio.list.action";
import { translate } from "@/utils/translate";
import React from "react";

export default async function NoMyStudioPage() {
  const res = await getStudioList({})
  if (res.studios) {
    return (
      <div className={'flex flex-col'}>

        <div className="w-full text-center text-[#BCBFC2] py-10">
          <p className="text-lg mb-2 text-black font-medium">{await translate('no_upcoming_lesson_title')}</p>
          <p className="text-sm text-gray-400">
            {await translate('no_upcoming_lesson_message')}
          </p>
        </div>

        <div
          className={'px-6 text-[24px] font-bold text-black'}
          dangerouslySetInnerHTML={{__html: (await translate('studio_recommendation')).replace(/\n/g, '<br />')}}
        />
        <ul className="flex flex-col space-y-4 mt-4">
          {(res.studios ?? []).map((item) => (
            <StudioItem key={item.id} item={item}/>
          ))}
        </ul>
      </div>
    )
  } else {
    return <div className={'text-black'}>{res.errorMessage}</div>
  }
}