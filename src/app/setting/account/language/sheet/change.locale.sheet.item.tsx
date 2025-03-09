'use client'
import { StringResource } from "@/shared/StringResource";
import { KloudScreen } from "@/shared/kloud.screen";
import { changeLocale } from "@/utils/translate";
import CheckIcon from "../../../../../../public/assets/check_white.svg";

export const ChangeLocaleSheetItem = ({ selectedLanguage, currentLocale: locale }: {
  selectedLanguage: keyof typeof StringResource,
  currentLocale: keyof typeof StringResource
}) => {
  const isSelected = selectedLanguage === locale;

  return (
    <li
      className={`flex items-center justify-between w-full p-4 rounded-lg text-lg font-medium border transition-transform duration-100 active:scale-[0.98]
        ${isSelected ? "bg-black text-white border-gray-700" : "bg-gray-100 text-black border-gray-300"}`
      }
      onClick={async () => {
        if (isSelected) {
          window.KloudEvent?.closeBottomSheet()
        } else {
          await changeLocale(locale);
          window.KloudEvent.clearAndPush(KloudScreen.Login);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">
          {locale === 'ko' ? '🇰🇷' : '🇺🇸'}
        </span>
        <span>{locale === 'ko' ? '한국어' : 'English'}</span>
      </div>

      {isSelected && <CheckIcon className="scale-125" />}
    </li>
  );
};
