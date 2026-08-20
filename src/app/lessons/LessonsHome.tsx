// 웹 PC 홈 — 예약 가능 수업 전체 목록 (GET /lessons/valid, 시작 시각 가까운 순).
// 루트(/)에서 PC(lg+)일 때 렌더된다. 로그인 여부와 무관하게 격자를 그린다.
// 응답이 비거나 실패하면 빈 상태 문구만.

import React from "react";
import { api } from "@/app/api.client";
import { ValidLessonsGrid } from "@/app/lessons/ValidLessonsGrid";
import { getLocale } from "@/utils/translate";

export async function LessonsHome() {
  const res = await api.lesson.listValidLessons({ page: 1 });
  const locale = await getLocale();
  const ok = 'lessons' in res;
  const lessons = ok ? res.lessons : [];
  const workshops = ok ? res.workshops ?? [] : [];
  // 신응답은 lessonsTotalPage — 구응답(단일 totalPage) 폴백
  const lessonsTotalPage = ok ? res.lessonsTotalPage ?? res.totalPage ?? 0 : 0;
  const workshopsTotalPage = ok ? res.workshopsTotalPage ?? 0 : 0;

  return (
    <div className="w-full min-h-screen bg-white pt-10 pb-16">
      {/* 중앙 정렬 대신 LNB 쪽(왼쪽)에 붙인다 — 우측만 여유 */}
      <div className="w-full max-w-[1400px] pl-6 pr-10">
        {/* 페이지 헤더('당신의 수업을 찾아보세요')는 그리드 컴포넌트 안에서
            워크샵 스포트라이트 '아래', 수업 격자 위에 그린다 */}
        <ValidLessonsGrid
          initialLessons={lessons}
          initialWorkshops={workshops}
          lessonsTotalPage={lessonsTotalPage}
          workshopsTotalPage={workshopsTotalPage}
          locale={locale}
        />
      </div>
    </div>
  );
}
