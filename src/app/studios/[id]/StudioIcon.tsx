'use client'

import React from "react";
import YoutubeIcon from "@/../public/assets/youtube-colored.svg"
import InstagramIcon from "@/../public/assets/instagram-colored.svg"

export type StudioIconType = 'instagram' | 'youtube'


export const StudioIcon = ({type, url, appVersion, variant = 'default'}: {
  type: StudioIconType,
  url: string,
  appVersion: string,
  /** 'overlay' — 커버 이미지 위에 얹는 흰 반투명 칩 (PC 스튜디오 상세). 기본은 기존 모바일 보더 원형. */
  variant?: 'default' | 'overlay',
}) => {

  const handleClickIcon = () => {
    if (appVersion !== '') {
      window.KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  }

  return <div
    className={variant === 'overlay'
      ? "w-11 h-11 flex items-center justify-center rounded-full p-2.5 bg-white/90 shadow-md backdrop-blur-sm cursor-pointer hover:bg-white active:scale-[0.95] transition-all duration-150"
      : "w-11 h-11 flex items-center justify-center border border-b-emerald-200 rounded-full p-2.5 active:scale-[0.98] active:bg-gray-100 transition-all duration-150"}
    onClick={handleClickIcon}
  >
    {type === 'instagram' && <InstagramIcon/>}
    {type === 'youtube' && <YoutubeIcon/>}
  </div>
}