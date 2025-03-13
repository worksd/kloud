'use server'

import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleEmoji } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const ChangeLocaleButton = async ({currentLocale}: { currentLocale: Locale }) => {
  return (
    <NavigateClickWrapper method={'showBottomSheet'} route={KloudScreen.LanguageSettingSheet}>
      <button className="absolute top-4 right-4 text-[20px] text-gray-600 hover:text-gray-800">
        {await getLocaleEmoji(currentLocale)}
      </button>
    </NavigateClickWrapper>
  )
}