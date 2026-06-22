'use client'

import React from "react";
import YoutubeIcon from "@/../public/assets/youtube-colored.svg"
import InstagramIcon from "@/../public/assets/instagram-colored.svg"

export type StudioIconType = 'instagram' | 'youtube' | 'homepage'


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
    {type === 'homepage' && (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#1E2124" strokeWidth="1.6"/>
        <path d="M3 12h18" stroke="#1E2124" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 3c2.5 2.5 3.8 5.8 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.8-3.8-9S9.5 5.5 12 3Z" stroke="#1E2124" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
}