import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { StudioFollowButton } from "@/app/studios/[id]/StudioFollowButton";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { CircleImage } from "@/app/components/CircleImage";

export const StudioItem = ({item}: { item: GetStudioResponse }) => {
  return (
    <div className="px-6 space-y-4 ₩">
      <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(item.id)}>

        <div className="flex items-center justify-between w-full max-w-md rounded-lg mt-4">
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
          <StudioFollowButton studioId={item.id} follow={item.follow}/>
        </div>
      </NavigateClickWrapper>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>

    </div>
  )
}