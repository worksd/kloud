'use client'
import { GetStudioResponse, StudioFollowResponse } from "@/app/endpoint/studio.endpoint";
import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import React, { useEffect, useState } from "react";
import { toggleFollowStudio } from "@/app/search/studio.follow.action";
import { useLocale } from "@/hooks/useLocale";

export const StudioItem = ({item}: { item: GetStudioResponse }) => {

  const [follow, setFollow] = useState(item.follow);
  const { t } = useLocale();

  const router = useRouter();
  const handleOnClick = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.StudioDetail(item.id))
    } else {
      router.push(KloudScreen.StudioDetail(item.id))
    }
  }

  const onClickFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    window.KloudEvent?.sendHapticFeedback()
    const res = await toggleFollowStudio({
      studioId: item.id,
      follow: follow
    })
    setFollow(res.follow)
    window.KloudEvent?.showToast(res.message)

  }

  return (
    <div className="px-6 space-y-4 active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none">
      <div className="flex items-center justify-between w-full max-w-md rounded-lg mt-4" onClick={handleOnClick}>
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
        <div onClick={(e) => e.stopPropagation()}>
          {/* 팔로우 버튼 */}
          <button
            onClick={onClickFollow}
            className={`px-2.5 py-1 text-sm font-medium rounded-full
          ${follow != null
              ? 'text-gray-500 border border-gray-300 hover:bg-gray-100'
              : 'text-white bg-black hover:bg-gray-900'
            }`}
          >
            {follow != null ? t('following') : t('follow')}
          </button>
        </div>
      </div>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>
    </div>
  )
}