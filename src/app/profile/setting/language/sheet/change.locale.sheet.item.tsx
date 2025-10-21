import { Locale } from "@/shared/StringResource";
import { KloudScreen } from "@/shared/kloud.screen";
import { getLocaleEmoji, getLocaleName } from "@/utils/translate";
import CheckIcon from "../../../../../../public/assets/check_white.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const ChangeLocaleSheetItem = ({selectedLanguage, locale}: {
  selectedLanguage: Locale,
  locale: Locale
}) => {
  const isSelected = selectedLanguage === locale

  return (
    <NavigateClickWrapper method={isSelected ? 'closeBottomSheet' : 'clearAndPush'}
                          route={isSelected ? undefined : KloudScreen.Login('')} // TODO: 웹에서도 외국어 대응시 returnUrl 넣어주기
                          locale={locale}
                          option={{
                            ignoreSafeArea: true
                          }}
                          action={'changeLocale'}>
      <li
        className={`flex items-center justify-between w-full p-4 rounded-lg text-lg font-medium border transition-transform duration-100 active:scale-[0.98]
        ${isSelected ? "bg-black text-white border-gray-700" : "bg-gray-100 text-black border-gray-300"}`
        }
      >
        <div className="flex items-center gap-2">
        <span className="text-xl">
          {getLocaleEmoji(locale)}
        </span>
          <span>
          {getLocaleName(locale)}
        </span>
        </div>

        {isSelected && <CheckIcon className="scale-125"/>}
      </li>

    </NavigateClickWrapper>
  );
};