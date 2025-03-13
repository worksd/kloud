import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { StudioFollowButton } from "@/app/studios/[id]/StudioFollowButton";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const StudioItem = ({item}: { item: GetStudioResponse }) => {
  return (
    <div className="px-6 space-y-4 active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
      <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(item.id)}>

        <div className="flex items-center justify-between w-full max-w-md rounded-lg mt-4">
          {/* 프로필 이미지 및 정보 */}
          <div className="flex items-center space-x-4">
            {/* 프로필 이미지 */}
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
              <img
                src={item.profileImageUrl}
                alt={item.name}
                className="w-full h-full object-cover"  // object-cover로 비율 유지
              />
            </div>
            {/* 텍스트 정보 */}
            <div>
              <div className="text-lg font-bold text-black">{item.name}</div>
              <div className="text-sm text-gray-500">{item.address}</div>
            </div>
          </div>
          <StudioFollowButton studioId={`${item.id}`} follow={item.follow}/>
        </div>
      </NavigateClickWrapper>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>

    </div>
  )
}