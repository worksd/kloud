'use client'

import { useState, useTransition } from "react";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { applyThemeToDocument, THEME_PREFERENCES, ThemePreference } from "@/shared/theme";
import { changeThemePreference } from "@/utils/theme";
import { SystemThemeIcon, LightThemeIcon, DarkThemeIcon } from "@/app/profile/setting/theme/ThemeIcons";

type Labels = { system: string; light: string; dark: string; systemDescription: string };

/**
 * 테마 선택 라디오 — 언어 설정(LanguageChangeForm)과 같은 생김새(선택 = 검정 카드 + 흰 체크).
 * 언어와 달리 재시작/리로드가 필요 없다: 누르는 순간 applyThemeToDocument 로 <html data-theme> 을 바꾸면
 * 빌드 때 심어 둔 CSS 변수가 즉시 뒤집히고, 쿠키 저장(서버 액션)은 다음 진입을 위한 것.
 */
export const ThemeChangeForm = ({preference, labels}: { preference: ThemePreference; labels: Labels }) => {
  const [current, setCurrent] = useState<ThemePreference>(preference);
  const [, startTransition] = useTransition();

  const select = (pref: ThemePreference) => {
    if (pref === current) return;
    setCurrent(pref);
    applyThemeToDocument(pref);
    startTransition(() => { void changeThemePreference(pref); });
  };

  const options: Array<{ value: ThemePreference; label: string; description?: string; icon: React.ReactNode }> = [
    { value: 'system', label: labels.system, description: labels.systemDescription, icon: <SystemThemeIcon/> },
    { value: 'light', label: labels.light, icon: <LightThemeIcon/> },
    { value: 'dark', label: labels.dark, icon: <DarkThemeIcon/> },
  ];
  // THEME_PREFERENCES 와 옵션 목록이 어긋나면 컴파일 때가 아니라 여기서 바로 드러나게
  if (process.env.NODE_ENV !== 'production' && options.length !== THEME_PREFERENCES.length) {
    console.warn('[ThemeChangeForm] options 와 THEME_PREFERENCES 가 다릅니다');
  }

  return (
    <ul className="flex flex-col w-full space-y-2" role="radiogroup">
      {options.map((option) => {
        const selected = current === option.value;
        return (
          <li key={option.value}>
            <label
              className={`flex items-center w-full p-4 rounded-lg cursor-pointer transition-colors duration-200
                ${selected ? 'bg-black border-2 border-black' : 'bg-gray-100'}`}
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={selected}
                onChange={() => select(option.value)}
                className="hidden"
              />
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0
                  ${selected ? 'bg-black border-white' : 'bg-[#22222233] border-white'}`}
              >
                {selected && <CheckIcon/>}
              </div>
              <span className={`ml-4 shrink-0 ${selected ? 'text-white' : 'text-[#222222]'}`}>{option.icon}</span>
              <div className="ml-3 flex flex-col min-w-0">
                <span className={`text-[14px] font-paperlogy ${selected ? 'text-white font-bold' : 'text-[#222222] font-medium'}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className={`text-[12px] mt-0.5 ${selected ? 'text-[#BCBFC2]' : 'text-[#8B95A1]'}`}>
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
};
