import React from "react";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { RoomsAvailabilityResponse, StudioRoomResponse } from "@/app/endpoint/studio.room.endpoint";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

// 앱 홈의 "오늘 연습실 예약" 섹션. 홈 응답 roomSlots(오늘 KST 공개 홀 슬롯)를 그대로 쓰고,
// 홀 이름/이미지/스펙 등 메타는 studio.practiceRooms에서 studioRoomId로 조인한다.
// roomSlots가 없으면(스튜디오 없음 / 공개 홀 없음) 섹션 자체를 그리지 않는다.
// 다른 날짜 조회는 PracticeHallSchedule이 시트 오픈 시 availability API로 처리.
export async function HomeRoomSlotsSection({
  studioId,
  roomSlots,
  practiceRooms,
  locale,
}: {
  studioId: number;
  roomSlots?: RoomsAvailabilityResponse;
  practiceRooms?: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const rows = roomSlots?.rooms ?? [];
  if (rows.length === 0) return null; // undefined 가드 — 없으면 미표시

  const metaById = new Map<number, CommunityPracticeRoomResponse>(
    (practiceRooms ?? []).map((p) => [p.id, p]),
  );

  // roomSlots 각 홀 → 시간표 컴포넌트가 쓰는 홀 형태. 슬롯은 응답 그대로, 메타만 조인.
  const rooms: StudioRoomResponse[] = rows.map((row) => {
    const meta = metaById.get(row.studioRoomId);
    return {
      id: row.studioRoomId,
      name: meta?.name ?? row.name ?? '',
      description: meta?.description,
      maxNumber: meta?.maxNumber ?? 0,
      imageUrls: meta?.imageUrl ? [meta.imageUrl] : [],
      areaSize: meta?.areaSize,
      dimensions: meta?.dimensions,
      floorType: meta?.floorType,
      amenities: meta?.amenities,
      unitPrice: meta?.pricePerHour,
      slots: row.slots,
      myBookings: row.myBookings, // 비로그인 시 응답에 없음(undefined) → 안전
    };
  });

  return (
    <section className="px-4 mt-6">
      <h2 className="text-[20px] font-bold text-black mb-3">{await translate('home_today_room_status')}</h2>
      <PracticeHallSchedule rooms={rooms} locale={locale} navigateStudioId={studioId} />
    </section>
  );
}
