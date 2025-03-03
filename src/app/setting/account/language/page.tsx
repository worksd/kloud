"use client";
import { useLocale } from "@/hooks/useLocale";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { StringResource } from "@/shared/StringResource";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { CommonSubmitButton } from "@/app/components/buttons";

export default function LanguageSettings() {
  const {locale, changeLocale, t} = useLocale();

  const handleChangeLocale = (locale: keyof typeof StringResource) => {
    changeLocale(locale);
  }

  const handleSubmit = () => {
    // 언어 설정 저장 로직
    window.KloudEvent?.back();
    setInterval(() => {
      const dialogInfo = {
        id: 'Empty',
        type: 'SIMPLE',
        title: '언어 변경',
        message: '언어 변경에 성공했습니다.\n앱을 다시 실행합니다.',
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }, 700)

    setInterval(() => {
      window.KloudEvent?.forceEnd();
    }, 2000)
  }

  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto px-4">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="language_setting"/>
      </div>

      <ul className="flex flex-col w-full space-y-2">
        {/* 기존 라디오 버튼들 */}
        <li>
          <label className={`flex items-center w-full p-4 rounded-lg cursor-pointer 
            transition-colors duration-200 
            ${locale === "ko"
            ? 'bg-black border-2 border-black'
            : 'bg-gray-50'}`}
          >
            <input
              type="radio"
              name="language"
              value="ko"
              checked={locale === "ko"}
              onChange={() => handleChangeLocale('ko')}
              className="hidden"
            />
            <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 
              transition-all duration-200 
              ${locale === "ko"
              ? "bg-black border-white"
              : "bg-[#22222233] border-white"}`}
            >
              {locale === "ko" && <CheckIcon />}
            </div>
            <span className={`ml-4 text-[14px] ${
              locale === "ko"
                ? "text-white font-bold"
                : "text-[#222222] font-medium"
            }`}>
              🇰🇷 한국어
            </span>
          </label>
        </li>
        <li>
          <label className={`flex items-center w-full p-4 rounded-lg cursor-pointer 
            transition-colors duration-200 
            ${locale === "en"
            ? 'bg-black border-2 border-black'
            : 'bg-gray-50'}`}
          >
            <input
              type="radio"
              name="language"
              value="en"
              checked={locale === "en"}
              onChange={() => handleChangeLocale('en')}
              className="hidden"
            />
            <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 
              transition-all duration-200 
              ${locale === "en"
              ? "bg-black border-white"
              : "bg-[#22222233] border-white"}`}
            >
              {locale === "en" && <CheckIcon />}
            </div>
            <span className={`ml-4 text-[14px] ${
              locale === "en"
                ? "text-white font-bold"
                : "text-[#222222] font-medium"
            }`}>
              🇺🇸 English
            </span>
          </label>
        </li>
      </ul>

      {/* CommonSubmitButton 추가 */}
      <div className="mt-auto pb-6">
        <CommonSubmitButton
          originProps={{onClick: handleSubmit}}>
          <div>
            {t('confirm')}
          </div>
        </CommonSubmitButton>

      </div>
    </div>
  );
}