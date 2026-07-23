import React from "react";
import { getRoomsAvailabilityByIdsAction } from "@/app/community/community.actions";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { StudioRoomResponse } from "@/app/endpoint/studio.room.endpoint";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 스튜디오 상세의 홀(연습실) 예약현황 섹션. 홀 스펙은 studio.practiceRooms(별도 GET /studioRooms 호출 안 함),
// 예약현황(슬롯)만 GET /studioRooms/availability?studioRoomIds=... 로 조회해 병합.
export async function PracticeHallSection({
  practiceRooms,
  locale,
}: {
  practiceRooms?: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const specs = practiceRooms ?? [];
  if (specs.length === 0) return null;

  const studioRoomIds = specs.map((p) => p.id).join(',');
  const today = toDateStr(new Date());
  const availRes = await getRoomsAvailabilityByIdsAction({ studioRoomIds, date: today });
  const availRows = ('rooms' in availRes) ? availRes.rooms : [];
  const slotsByRoom = new Map(availRows.map((r) => [r.studioRoomId, r.slots]));

  // studio.practiceRooms 스펙 → 시간표 컴포넌트가 쓰는 홀 형태로 매핑 + 슬롯 병합
  const rooms: StudioRoomResponse[] = specs.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    maxNumber: p.maxNumber ?? 0,
    imageUrls: p.imageUrl ? [p.imageUrl] : [],
    areaSize: p.areaSize,
    dimensions: p.dimensions,
    floorType: p.floorType,
    amenities: p.amenities,
    slots: slotsByRoom.get(p.id) ?? [],
  }));

  return (
    <>
      <div className="w-full h-3 bg-[#f7f8f9]" />
      <div className="px-4 mt-6">
        <h2 className="text-[20px] font-bold text-black mb-3">{await translate('community_hall_status')}</h2>
        <PracticeHallSchedule rooms={rooms} locale={locale} />
      </div>
    </>
  );
}
