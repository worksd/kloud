import React from "react";
import { CommunityPracticeRoomGrid } from "@/app/community/CommunityPracticeRoomGrid";
import { getCommunityAction } from "@/app/community/community.actions";
import { getLocale, translate } from "@/utils/translate";

// 커뮤니티 탭 — 연습실 전용 스튜디오 목록(격자). GET /community 실 데이터.
export default async function CommunityPage() {
  const res = await getCommunityAction();
  const studios = ('practiceRoomStudios' in res) ? res.practiceRoomStudios : [];
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 — 상단 고정 */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-4 pb-3 border-b border-[#F1F3F6]">
        <h1 className="text-[20px] font-bold text-[#171717]">{await translate('practice_room')}</h1>
      </div>

      <CommunityPracticeRoomGrid studios={studios} locale={locale} />
    </div>
  );
}
