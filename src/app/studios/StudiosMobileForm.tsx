// 모바일/앱 웹뷰 스튜디오 목록 진입점 — 현재 글로벌 list 페이지 없음.
// 스튜디오 상세는 /studios/{id} 별도 라우트로 진입.

import React from "react";

export default function StudiosMobileForm() {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-8">
      <div className="text-center flex flex-col gap-2">
        <span className="text-[16px] font-bold text-black">스튜디오 목록</span>
        <span className="text-[13px] text-[#86898C]">홈에서 스튜디오를 선택하거나 검색해주세요</span>
      </div>
    </div>
  );
}
