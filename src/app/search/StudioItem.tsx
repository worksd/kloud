'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { CircleImage } from "@/app/components/CircleImage";

export const StudioItem = ({item}: { item: GetStudioResponse }) => {
  return (
    <div>
      <div
        className="px-6 py-4 active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
        <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(item.id)}>
          <div className="flex items-center justify-between w-full max-w-md rounded-lg">
            {/* 프로필 이미지 및 정보 */}
            <div className="flex items-center space-x-4">
              {/* 프로필 이미지 */}
              <CircleImage imageUrl={item.profileImageUrl} size={60}/>
              {/* 텍스트 정보 */}
              <div>
                <div className="text-lg font-bold text-black">{item.name}</div>
                <div className="text-sm text-gray-500">{item.address}</div>
              </div>
            </div>
          </div>
        </NavigateClickWrapper>
      </div>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>
    </div>
  )
}