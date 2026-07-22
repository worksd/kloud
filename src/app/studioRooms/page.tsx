import React from "react";
import { api } from "@/app/api.client";
import { getLocale, translate } from "@/utils/translate";
import { BackButton } from "@/app/payment/BackButton";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { PartnerScheduleBoard } from "@/app/studioRooms/PartnerScheduleBoard";
import { PartnerRoomAvailabilityResponse } from "@/app/endpoint/studio.room.endpoint";

// 오늘(KST) 'YYYY-MM-DD'. 서버 타임존과 무관하게 서울 기준.
const todayKST = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); // 'YYYY-MM-DD'

// 파트너(관리자) 홀 예약 일정표 — GET /studioRooms/availability (X-Guinness-Client: PARTNER)
export default async function StudioRoomsSchedulePage({ searchParams }: {
  searchParams: Promise<{ date?: string; appVersion?: string }>;
}) {
  const { date: dateParam, appVersion = '' } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayKST();
  const locale = await getLocale();
  const title = await translate('room_schedule_title');

  // 파트너 토큰의 스튜디오(들) → 각 스튜디오 홀 목록 → 홀 ID 수집
  const my = await api.studio.my({});
  const studios = isGuinnessErrorCase(my) ? [] : my.studios;
  const roomLists = await Promise.all(
    studios.map((s) => api.studioRoom.list({ studioId: s.id }))
  );
  const roomIds = roomLists.flatMap((r) =>
    isGuinnessErrorCase(r) ? [] : r.studioRooms.map((room) => room.id)
  );

  // availability는 studioRoomIds 필수(파트너). 홀이 없으면 빈 상태.
  let rooms: PartnerRoomAvailabilityResponse[] = [];
  if (roomIds.length > 0) {
    const res = await api.studioRoom.availabilityPartner({
      studioRoomIds: roomIds.join(','),
      date,
    });
    if (!isGuinnessErrorCase(res)) rooms = res.rooms ?? [];
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 웹은 자체 헤더, 네이티브는 앱 타이틀바가 처리 */}
      {appVersion === '' && (
        <div className="sticky top-0 z-30 bg-white border-b border-[#F1F3F6]">
          <div className="relative h-14 flex items-center justify-center">
            <div className="absolute left-0 top-0 h-14 flex items-center">
              <BackButton />
            </div>
            <h1 className="text-[17px] font-bold text-[#191f28]">{title}</h1>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">
          {await translate('room_schedule_empty')}
        </p>
      ) : (
        <PartnerScheduleBoard
          date={date}
          rooms={rooms}
          locale={locale}
          appVersion={appVersion}
          labels={{
            closed: await translate('room_schedule_closed'),
            lesson: await translate('room_schedule_lesson'),
            noBooking: await translate('room_schedule_no_booking'),
            individual: await translate('room_booking_type_individual'),
            full: await translate('room_booking_type_full'),
          }}
        />
      )}
    </div>
  );
}
