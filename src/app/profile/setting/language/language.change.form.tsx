'use client'

import { useEffect, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { changeLocale, getLocaleText, translate } from "@/utils/translate";
import { TranslatableText } from "@/utils/TranslatableText";
import { kloudNav } from "@/app/lib/kloudNav";

export const LanguageChangeForm = ({locale, confirmText}: { locale: Locale, confirmText: string }) => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  const handleChangeLocale = async (newLocale: Locale) => {
    setCurrentLocale(newLocale);
  };

  const handleClickSubmit = async () => {
    const dialog = await createDialog({
      id: 'ChangeLocale',
      message: `\n${(await getLocaleText({currentLocale}))}\n\n ${await translate('change_locale_dialog_message')}`
    });
    window.KloudEvent.showDialog(JSON.stringify(dialog));
  };

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (currentLocale) {
        await changeLocale(currentLocale)
      }
      kloudNav.clearAndPush(KloudScreen.Splash)
    }
  }, [currentLocale]);

  const languageOptions = [
    {value: 'ko', label: '🇰🇷 한국어'},
    {value: 'en', label: '🇺🇸 English'},
    {value: 'jp', label: '🇯🇵 日本語'},
    {value: 'zh', label: '🇨🇳 中文'},
  ] as const;

  return (
    <div className="fixed inset-0 flex flex-col bg-white px-4 mt-14">
      <ul className="flex flex-col w-full space-y-2 mt-4">
        {languageOptions.map((option) => (
          <li key={option.value}>
            <label
              className={`flex items-center w-full p-4 rounded-lg cursor-pointer
                transition-colors duration-200
                ${currentLocale === option.value
                ? 'bg-black border-2 border-black'
                : 'bg-gray-100'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={option.value}
                checked={currentLocale === option.value}
                onChange={() => handleChangeLocale(option.value)}
                className="hidden"
              />
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full border-2
                  transition-all duration-200
                  ${currentLocale === option.value
                  ? "bg-black border-white"
                  : "bg-[#22222233] border-white"
                }`}
              >
                {currentLocale === option.value && <CheckIcon/>}
              </div>
              <span
                className={`ml-4 text-[14px] ${
                  currentLocale === option.value
                    ? "text-white font-bold"
                    : "text-[#222222] font-medium"
                }`}
              >
                {option.label}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white">
        <CommonSubmitButton originProps={{onClick: handleClickSubmit}}>
          {confirmText}
        </CommonSubmitButton>
      </div>
    </div>
  );
};