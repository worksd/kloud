import React from "react";
import { CommunityPracticeRoomGrid } from "@/app/community/CommunityPracticeRoomGrid";
import { MOCK_COMMUNITY_STUDIOS } from "@/app/community/community.mock";

// 커뮤니티 탭 — 연습실 전용 스튜디오 목록(격자). 실제 API 나오기 전 Mock 데이터 사용.
export default async function CommunityPage() {
  const studios = MOCK_COMMUNITY_STUDIOS;

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 — 상단 고정 */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-4 pb-3 border-b border-[#F1F3F6]">
        <h1 className="text-[20px] font-bold text-[#171717]">커뮤니티</h1>
      </div>

      {/* 연습실 밴드 */}
      <div className="px-4 pt-4 pb-1">
        <h2 className="text-[17px] font-bold text-[#171717]">연습실</h2>
      </div>
      <CommunityPracticeRoomGrid studios={studios} />
    </div>
  );
}
