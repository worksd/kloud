'use client'

import React from "react";
import YoutubeIcon from "@/../public/assets/youtube-colored.svg"
import InstagramIcon from "@/../public/assets/instagram-colored.svg"

export type StudioIconType = 'instagram' | 'youtube'


export const StudioIcon = ({type, url}: { type: StudioIconType, url: string }) => {

  const handleClickIcon = () => {
    window.KloudEvent.openExternalBrowser(url)
  }

  return <div
    className={'border border-[#F7F8F9] rounded-full p-2.5 active:scale-[0.98] active:bg-gray-100 transition-all duration-150'}
    onClick={handleClickIcon}
  >
    {type === 'instagram' && <InstagramIcon/>}
    {type === 'youtube' && <YoutubeIcon/>}
  </div>
}