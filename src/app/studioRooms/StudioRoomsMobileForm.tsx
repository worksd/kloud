// 모바일/앱 웹뷰 연습실 목록 — 현재 글로벌 list API 없음.
// studioId 없는 진입은 안내 메시지 노출 (특정 스튜디오 → /studioRooms/{id} 상세는 별도 라우트).

import React from "react";

export default function StudioRoomsMobileForm() {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-8">
      <div className="text-center flex flex-col gap-2">
        <span className="text-[16px] font-bold text-black">스튜디오를 먼저 선택해주세요</span>
        <span className="text-[13px] text-[#86898C]">스튜디오 상세 페이지에서 연습실을 확인할 수 있어요</span>
      </div>
    </div>
  );
}
