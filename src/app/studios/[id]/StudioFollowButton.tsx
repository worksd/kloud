'use client'

import React, { useEffect, useState } from "react";
import { toggleFollowStudio } from "@/app/search/studio.follow.action";
import { extractNumber } from "@/utils";
import { StudioFollowResponse } from "@/app/endpoint/studio.follow.endpoint";
import { useLocale } from "@/hooks/useLocale";

export const StudioFollowButton = ({studioId, follow} : {studioId: string, follow?: StudioFollowResponse}) => {
  const { t } = useLocale();
  const [currentFollow , setFollow] = React.useState<StudioFollowResponse | undefined>(follow);
  const [mounted, setMounted ] = useState(false);

  const onClickFollow = async (e: React.MouseEvent) => {
    window.KloudEvent?.sendHapticFeedback()
    const res = await toggleFollowStudio({
      studioId: extractNumber(studioId),
      follow: follow
    })
    setFollow(res.follow)
    if (res.message) {
      window.KloudEvent?.showToast(res.message)
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      onClick={onClickFollow}
      className={`px-2.5 py-1 text-sm font-medium rounded-full 
          ${currentFollow
        ? 'text-gray-500 border border-gray-300 hover:bg-gray-100'
        : 'text-white bg-black border border-black hover:bg-gray-900'
      }`}
    >
      {mounted ? (currentFollow ? t('following') : t('follow')) : ''}
    </div>
  )
}