'use client'

import { Locale } from "@/shared/StringResource";
import BottomArrowIcon from "@/../public/assets/ic_arrow_bottom.svg"
import { useState } from "react";
import { LOCALE_MAP } from "@/app/components/LocaleMap";
import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { ChangeLocalBottomSheet } from "@/app/profile/setting/language/sheet/change.locale.bottom.sheet";

export const ChangeLocaleButton = ({currentLocale, selectLanguageText}: {
  currentLocale: Locale,
  selectLanguageText: string
}) => {
  const [isSheetOpened, setIsSheetOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-row items-center text-[20px] space-x-1" onClick={() => setIsSheetOpen(true)}>
        {LOCALE_MAP[currentLocale].emoji}
        <div className={'text-[16px] text-black font-medium'}>
          {LOCALE_MAP[currentLocale].name}
        </div>
        <BottomArrowIcon/>
      </div>

      {isSheetOpened &&
        <CommonBottomSheet open={isSheetOpened} onCloseAction={() => setIsSheetOpen(false)}>
          <ChangeLocalBottomSheet selectedLanguage={currentLocale} selectLanguageText={selectLanguageText}
                                  onCloseAction={() => setIsSheetOpen(false)}/>
        </CommonBottomSheet>
      }
    </div>
  )
}