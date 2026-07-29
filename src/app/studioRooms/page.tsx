import React from "react";
import { cookies } from "next/headers";
import { getLocale, translate } from "@/utils/translate";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { studioKey } from "@/shared/cookies.key";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PartnerRoomBookingsBoard } from "@/app/studioRooms/PartnerRoomBookingsBoard";
import { OpenInApp } from "@/app/components/OpenInApp";

// 파트너(관리자) 예약일정표 — GET /studios/:id의 practiceRooms로 홀 셀렉터,
// 선택 홀의 GET /roomBookings?studioRoomId= 목록 표시. (파트너 토큰으로 스코프)
// studioId는 쿼리로 받지 않고 'studio' 쿠키(현재 스튜디오)에서 읽음.
// 웹(브라우저)에선 볼 수 없고 앱으로 바운스. 앱(webview, appVersion 세팅)에서만 렌더.
export default async function StudioRoomsSchedulePage({ searchParams }: {
  searchParams: Promise<{ appVersion?: string }>;
}) {
  const { appVersion = '' } = await searchParams;
  const locale = await getLocale();

  // 웹 진입 → 앱 열기(딥링크). 이 페이지는 앱 전용.
  if (appVersion === '') {
    return <OpenInApp path="/studioRooms" locale={locale} />;
  }

  const studioId = Number((await cookies()).get(studioKey)?.value);

  // studioId 없으면 안내 UI
  if (!studioId) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">{await translate('room_schedule_no_studio')}</p>
      </div>
    );
  }

  const studio = await getStudioDetail(studioId);
  if (isGuinnessErrorCase(studio)) {
    throw new Error(`studioRooms: failed to load studio ${studioId} — ${studio.code}: ${studio.message}`);
  }
  const practiceRooms = studio.practiceRooms ?? [];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {practiceRooms.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">{await translate('room_schedule_empty')}</p>
      ) : (
        <PartnerRoomBookingsBoard practiceRooms={practiceRooms} locale={locale} />
      )}
    </div>
  );
}
