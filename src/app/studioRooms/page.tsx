import React from "react";
import { getLocale, translate } from "@/utils/translate";
import { BackButton } from "@/app/payment/BackButton";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PartnerRoomBookingsBoard } from "@/app/studioRooms/PartnerRoomBookingsBoard";
import { OpenInApp } from "@/app/components/OpenInApp";

// 파트너(관리자) 예약일정표 — GET /studios/:id의 practiceRooms로 홀 셀렉터,
// 선택 홀의 GET /roomBookings?studioRoomId= 목록 표시. (studio.my 미사용, 파트너 토큰으로 스코프)
// 웹(브라우저)에선 볼 수 없고 앱으로 바운스. 앱(webview, appVersion 세팅)에서만 렌더.
export default async function StudioRoomsSchedulePage({ searchParams }: {
  searchParams: Promise<{ studioId?: string; appVersion?: string }>;
}) {
  const { studioId: studioIdParam, appVersion = '' } = await searchParams;
  const locale = await getLocale();

  // 웹 진입 → 앱 열기(딥링크). 이 페이지는 앱 전용.
  if (appVersion === '') {
    return <OpenInApp path="/studioRooms" locale={locale} />;
  }

  const studioId = Number(studioIdParam);
  const title = await translate('room_schedule_title');

  const Header = () => (
    appVersion === '' ? (
      <div className="sticky top-0 z-30 bg-white border-b border-[#F1F3F6]">
        <div className="relative h-14 flex items-center justify-center">
          <div className="absolute left-0 top-0 h-14 flex items-center"><BackButton /></div>
          <h1 className="text-[17px] font-bold text-[#191f28]">{title}</h1>
        </div>
      </div>
    ) : null
  );

  // studioId(query) 없으면 안내 UI
  if (!studioId) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header />
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
      <Header />
      {practiceRooms.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">{await translate('room_schedule_empty')}</p>
      ) : (
        <PartnerRoomBookingsBoard practiceRooms={practiceRooms} locale={locale} />
      )}
    </div>
  );
}
