// 웹 PC 홈 — 예약 가능 수업 전체 목록 (GET /lessons/valid, 시작 시각 가까운 순).
// 밴드/히어로 없이 5열 세로 썸네일 격자 하나로만 보여준다. 스크롤로 다음 페이지 로드.

import React from "react";
import Link from "next/link";
import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import { ValidLessonsGrid } from "@/app/lessons/ValidLessonsGrid";
import { getLocale } from "@/utils/translate";

export default async function LessonsPage() {
  const res = await api.lesson.listValidLessons({ page: 1 });
  const locale = await getLocale();

  // 로그인 필요 API — 비로그인/오류면 로그인 유도
  if (!('lessons' in res)) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 pb-24 text-center">
          <span className="text-[18px] font-bold text-black">로그인하고 수업을 둘러보세요</span>
          <span className="text-[14px] text-[#86898C]">지금 예약 가능한 수업을 한눈에 볼 수 있어요</span>
          <Link
            href={KloudScreen.LoginIntro(`?returnUrl=${encodeURIComponent('/lessons')}`)}
            className="mt-2 h-11 px-6 rounded-full bg-black text-white text-[14px] font-semibold flex items-center hover:bg-gray-800 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pt-10 pb-16">
      {/* 중앙 정렬 대신 LNB 쪽(왼쪽)에 붙인다 — 우측만 여유 */}
      <div className="w-full max-w-[1400px] pl-6 pr-10">
        {/* 목록 성격(예약 가능 + 시작 임박순)을 한 줄로 */}
        <header className="mb-7">
          <h1 className="text-[22px] font-bold text-black tracking-tight">Rawgraphy에서 예약할 수 있는 수업</h1>
          <p className="text-[13px] text-[#86898C] mt-1">시작 시간이 가까운 순으로 보여드려요</p>
        </header>
        <ValidLessonsGrid initialLessons={res.lessons} totalPage={res.totalPage} locale={locale}/>
      </div>
    </div>
  );
}
