'use server'

import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleEmoji, getLocaleName } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import BottomArrowIcon from "@/../public/assets/ic_arrow_bottom.svg"

export const ChangeLocaleButton = async ({currentLocale}: { currentLocale: Locale }) => {
  return (
    <NavigateClickWrapper method={'showBottomSheet'} route={KloudScreen.LanguageSettingSheet}>
      <div className="flex flex-row items-center text-[20px] space-x-1">
       {await getLocaleEmoji(currentLocale)}
        <div className={'text-[16px] text-black font-medium'}>
          {await getLocaleName(currentLocale)}
        </div>
        <BottomArrowIcon/>
      </div>
    </NavigateClickWrapper>
  )
}