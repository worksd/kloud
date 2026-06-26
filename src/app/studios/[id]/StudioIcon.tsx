'use client'

import React from "react";
import YoutubeIcon from "@/../public/assets/youtube-colored.svg"
import InstagramIcon from "@/../public/assets/instagram-colored.svg"

export type StudioIconType = 'instagram' | 'youtube'


export const StudioIcon = ({type, url, appVersion}: { type: StudioIconType, url: string, appVersion: string }) => {

  const handleClickIcon = () => {
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  }

  return <div
    className="w-11 h-11 flex items-center justify-center border border-b-emerald-200 rounded-full p-2.5 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
    onClick={handleClickIcon}
  >
    {type === 'instagram' && <InstagramIcon/>}
    {type === 'youtube' && <YoutubeIcon/>}
  </div>
}