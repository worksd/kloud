'use client'

import { KloudScreen } from "@/shared/kloud.screen";
import { StringResource } from "@/shared/StringResource";

export const ChangeLocaleButton = ({currentLocale} : {currentLocale: keyof typeof StringResource}) => {
  return (
    <button className="absolute top-4 right-4 text-[20px] text-gray-600 hover:text-gray-800" onClick={() => {
      window.KloudEvent?.showBottomSheet(KloudScreen.LanguageSettingSheet)
    }}>
      {currentLocale === 'ko' ? '🇰🇷' : currentLocale === 'jp' ? '🇯🇵' : '🇺🇸'}
    </button>
  )
}