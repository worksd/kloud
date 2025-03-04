
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { StringResource } from "@/shared/StringResource";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { CommonSubmitButton } from "@/app/components/buttons";
import { cookies } from "next/headers";
import { localeKey } from "@/shared/cookies.key";
import { translate } from "@/utils/translate";

export default async function LanguageSettings() {
  const locale = (await cookies()).get(localeKey)?.value

  const handleChangeLocale = (locale: keyof typeof StringResource) => {
  }

  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto px-4">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="language_setting"/>
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
        <CommonSubmitButton>
          <div>
            {await translate('confirm')}
          </div>
        </CommonSubmitButton>

      </div>
    </div>
  );
}