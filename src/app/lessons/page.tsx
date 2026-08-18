// 웹 PC 홈 — 예약 가능 수업 전체 목록 (GET /lessons/valid, 시작 시각 가까운 순).
// 로그인 여부와 무관하게 격자를 그린다. 응답이 비거나 실패하면 빈 상태 문구만.

import React from "react";
import { api } from "@/app/api.client";
import { ValidLessonsGrid } from "@/app/lessons/ValidLessonsGrid";
import { getLocale, translate } from "@/utils/translate";

export default async function LessonsPage() {
  const res = await api.lesson.listValidLessons({ page: 1 });
  const locale = await getLocale();
  const lessons = 'lessons' in res ? res.lessons : [];
  const totalPage = 'lessons' in res ? res.totalPage : 0;

  return (
    <div className="w-full min-h-screen bg-white pt-10 pb-16">
      {/* 중앙 정렬 대신 LNB 쪽(왼쪽)에 붙인다 — 우측만 여유 */}
      <div className="w-full max-w-[1400px] pl-6 pr-10">
        {/* 기능 설명 대신 사용자를 부르는 한 줄 (큰 플랫폼 톤) */}
        <header className="mb-7">
          <h1 className="text-[24px] font-bold text-black tracking-tight">{await translate('lessons_home_title')}</h1>
          <p className="text-[14px] text-[#86898C] mt-1.5">{await translate('lessons_home_subtitle')}</p>
        </header>
        <ValidLessonsGrid initialLessons={lessons} totalPage={totalPage} locale={locale}/>
      </div>
    </div>
  );
}
