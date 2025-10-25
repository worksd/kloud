import { Locale } from "@/shared/StringResource";
import { KloudScreen } from "@/shared/kloud.screen";
import CheckIcon from "../../../../../../public/assets/ic_check.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { LOCALE_MAP } from "@/app/components/LocaleMap";

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
        className={`flex items-center justify-between w-full p-4 rounded-[16px] text-[16px] transition-transform border duration-100 active:scale-[0.98]
        ${isSelected ? "bg-white border-black font-bold" : "border-[#F2F4F6]"}`
        }
      >
        <div className="flex items-center gap-1">
        <span className="text-xl">
          {LOCALE_MAP[locale].emoji}
        </span>
          <span>
          {LOCALE_MAP[locale].name}
        </span>
        </div>

        {isSelected && <CheckIcon/>}
      </li>

    </NavigateClickWrapper>
  );
};