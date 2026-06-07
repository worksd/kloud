// 모바일/앱 웹뷰 행사 진입점 — 현재 글로벌 list 페이지 없음.
// 행사는 홈 진입 시 EventScreen으로 다이얼로그 노출되는 흐름이라 별도 안내 메시지만 노출.

import React from "react";

export default function EventsMobileForm() {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-8">
      <div className="text-center flex flex-col gap-2">
        <span className="text-[16px] font-bold text-black">진행 중인 행사가 없어요</span>
        <span className="text-[13px] text-[#86898C]">새로운 이벤트가 열리면 홈 화면에서 안내드려요</span>
      </div>
    </div>
  );
}
