// 내 정규반 상세 — 다니는 요일. 기간 표의 다른 줄처럼 왼쪽 '수업 요일' 라벨, 오른쪽에 다니는 요일만 검정 사각형(Paperlogy)으로 — '화' '목'.
// 안 다니는 요일 칸은 그리지 않고, '매주 화' 같은 글자도 안 쓴다.

import React from "react";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

const SHORT: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
// 월요일 시작
const ORDER = [1, 2, 3, 4, 5, 6, 0];

// 서버 컴포넌트 — 문구는 translate(getLocaleString 은 클라이언트 전용)
export const RegularClassWeekStrip = async ({ days, locale }: {
  days?: number[] | null;
  locale: Locale;
}) => {
  const on = new Set((days ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6));
  if (on.size === 0) return null;
  const labels = SHORT[locale] ?? SHORT.en;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] text-[#86898C] shrink-0">{await translate('regular_class_schedule_label')}</span>
      <span className="flex items-center gap-1.5">
        {ORDER.filter((d) => on.has(d)).map((d) => (
          <span key={d} className="w-8 h-8 rounded-lg bg-[#191F28] text-white flex items-center justify-center text-[13px] font-bold font-paperlogy">
            {labels[d]}
          </span>
        ))}
      </span>
    </div>
  );
};
