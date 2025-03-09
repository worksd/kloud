'use client'

import { useLocale } from "@/hooks/useLocale";
import { useEffect, useState } from "react";
import { StringResource } from "@/shared/StringResource";
import { createDialog } from "@/utils/dialog.factory";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { CommonSubmitButton } from "@/app/components/buttons";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { KloudScreen } from "@/shared/kloud.screen";
import { changeLocale } from "@/utils/translate";

export const LanguageChangeForm = () => {
  const { t, locale } = useLocale();
  const [currentLocale, setCurrentLocale] = useState<keyof typeof StringResource | undefined>(undefined);

  const handleChangeLocale = async (newLocale: keyof typeof StringResource) => {
    setCurrentLocale(newLocale);
  };

  const handleClickSubmit = async () => {
    const localeText = currentLocale === 'ko'
      ? '🇰🇷 한국어'
      : currentLocale === 'en'
        ? '🇺🇸 English'
        : currentLocale === 'jp'
          ? '🇯🇵 日本語'
          : '';
    const dialog = await createDialog('ChangeLocale', `\n${localeText}\n\n ${t('change_locale_dialog_message')}`);
    window.KloudEvent.showDialog(JSON.stringify(dialog));
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (currentLocale) {
        await changeLocale(currentLocale)
      }
      window.KloudEvent?.clearAndPush(KloudScreen.Splash)
    }
  }, [currentLocale]);

  if (!mounted) return null;

  const languageOptions = [
    { value: 'ko', label: '🇰🇷 한국어' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'jp', label: '🇯🇵 日本語' }
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
                {currentLocale === option.value && <CheckIcon />}
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
        <CommonSubmitButton originProps={{ onClick: handleClickSubmit }}>
          <div>
            {t('confirm')}
          </div>
        </CommonSubmitButton>
      </div>
    </div>
  );
};