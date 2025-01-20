'use client'
import { GetStudioResponse, StudioFollowResponse } from "@/app/endpoint/studio.endpoint";
import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import { toggleFollowStudio } from "@/app/search/studio.follow.action";
import React, { useEffect, useState } from "react";

export const StudioItem = ({item}: { item: GetStudioResponse }) => {

  const [actionState, formAction] = React.useActionState(toggleFollowStudio, {
    studioId: item.id,
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    message: undefined,
    follow: item.follow,
  });

  const [isFollow, setIsFollow] = useState(item.follow != null);

  const router = useRouter();
  const handleOnClick = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.StudioDetail(item.id))
    } else {
      router.push(KloudScreen.StudioDetail(item.id))
    }
  }

  const handleSubmit = () => {
    if (window.KloudEvent) {
      window.KloudEvent.sendHapticFeedback()
    }
  }

  useEffect(() => {
    if (actionState.sequence >= 0) {
      setIsFollow(actionState.follow != null)

      if (window.KloudEvent && actionState.message) {
        window.KloudEvent.showToast(actionState.message)
      }
    }
  }, [actionState])

  return (
    <div className="px-6 space-y-4">
      <div className="flex items-center justify-between w-full max-w-md bg-white rounded-lg">
        {/* 프로필 이미지 및 정보 */}
        <div className="flex items-center space-x-4" onClick={handleOnClick}>
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
        <form action={formAction}
              onSubmit={handleSubmit}>
          {/* 팔로우 버튼 */}
          <button

            className={`px-2.5 py-1 text-sm font-medium rounded-full
          ${isFollow
              ? 'text-gray-500 border border-gray-300 hover:bg-gray-100'
              : 'text-white bg-black hover:bg-gray-900'
            }`}
          >
            {isFollow ? '팔로잉' : '팔로우'}
          </button>
        </form>
      </div>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>
    </div>
  )
}


export interface ToggleFollowActionResult {
  studioId: number;
  sequence: number,
  errorCode?: string,
  errorMessage?: string,
  message?: string,
  follow?: StudioFollowResponse,
}