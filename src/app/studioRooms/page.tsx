// /studioRooms — 글로벌 진입점.
// - 앱 웹뷰: 안내 메시지 (글로벌 list API 없음, 스튜디오별 상세 페이지 사용 유도)
// - PC 웹(lg+): mock list 그리드. 카드 클릭 시 /studioRooms/{id} 상세 이동.

import React from "react";
import StudioRoomsMobileForm from "@/app/studioRooms/StudioRoomsMobileForm";
import StudioRoomsPcForm from "@/app/studioRooms/StudioRoomsPcForm";

export default async function StudioRoomsListPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const { appVersion = '' } = await searchParams;
  const isWeb = appVersion === '';

  if (!isWeb) {
    return <StudioRoomsMobileForm/>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <StudioRoomsPcForm/>
      </div>
      <div className="lg:hidden">
        <StudioRoomsMobileForm/>
      </div>
    </>
  );
}
