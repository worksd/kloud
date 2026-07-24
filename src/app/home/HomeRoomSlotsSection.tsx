import React from "react";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { RoomSlotsSummaryResponse, StudioRoomResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

// 앱 홈의 "오늘 연습실 예약" 섹션. 홈 응답 roomSlots(오늘 KST 방별 예약 가능 정시 목록)를 쓰고,
// 홀 이미지/가격/스펙 등 메타는 studio.practiceRooms에서 id로 조인한다.
// roomSlots가 없으면(스튜디오 없음 / 공개 홀 없음) 섹션 자체를 그리지 않는다.
// 카드 탭 시 시트 대신 스튜디오 상세로 이동(navigateStudioId) — 날짜 이동/상세 예약은 상세에서.
export async function HomeRoomSlotsSection({
  studioId,
  roomSlots,
  practiceRooms,
  locale,
}: {
  studioId: number;
  roomSlots?: RoomSlotsSummaryResponse;
  practiceRooms?: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const rows = roomSlots?.rooms ?? [];
  if (rows.length === 0) return null; // undefined 가드 — 없으면 미표시

  const metaById = new Map<number, CommunityPracticeRoomResponse>(
    (practiceRooms ?? []).map((p) => [p.id, p]),
  );

  // roomSlots 각 홀 → 시간표 컴포넌트가 쓰는 홀 형태. availableHours(정시 hour) → 0~23시 슬롯으로 변환.
  const rooms: StudioRoomResponse[] = rows.map((row) => {
    const meta = metaById.get(row.id);
    const hourSet = new Set(row.availableHours ?? []);
    return {
      id: row.id,
      name: row.name || meta?.name || '',
      description: meta?.description,
      maxNumber: meta?.maxNumber ?? 0,
      imageUrls: meta?.imageUrl ? [meta.imageUrl] : [],
      areaSize: meta?.areaSize,
      dimensions: meta?.dimensions,
      floorType: meta?.floorType,
      amenities: meta?.amenities,
      unitPrice: meta?.pricePerHour,
      // availableHours에 든 시각만 예약가능(청록), 나머지는 마감(회색). 가격은 방 기본 시간당가.
      slots: Array.from({ length: 24 }, (_, h): TimeSlotResponse => ({
        time: `${String(h).padStart(2, '0')}:00`,
        status: hourSet.has(h) ? 'available' : 'closed',
        currentCount: 0,
        maxCount: meta?.maxNumber ?? 0,
        price: meta?.pricePerHour ?? null,
      })),
    };
  });

  return (
    <section className="px-4 mt-6">
      <h2 className="text-[20px] font-bold text-black mb-3">{await translate('home_today_room_status')}</h2>
      <PracticeHallSchedule rooms={rooms} locale={locale} navigateStudioId={studioId} />
    </section>
  );
}
