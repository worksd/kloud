import React from "react";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { StudioRoomResponse } from "@/app/endpoint/studio.room.endpoint";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";

// TODO(mock): BE가 practiceRooms[].available을 아직 안 내려줌. 내려오기 전까지 임시 목업.
const MOCK_AVAILABLE_HOURS = [10, 11, 12, 14, 15, 16, 17, 18, 19, 20];

// 스튜디오 상세의 홀(연습실) 예약현황 섹션. 홀 스펙·예약가능시간 모두 studio.practiceRooms만 사용
// (별도 availability API 호출 없음). available: 예약 가능한 정수 시각 → 1시간 단위 슬롯으로 변환.
export async function PracticeHallSection({
  practiceRooms,
  locale,
}: {
  practiceRooms?: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const specs = practiceRooms ?? [];
  if (specs.length === 0) return null;

  // studio.practiceRooms 스펙 → 시간표 컴포넌트가 쓰는 홀 형태로 매핑. available → 슬롯.
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
    unitPrice: p.pricePerHour,
    slots: [...(p.available ?? MOCK_AVAILABLE_HOURS)]
      .sort((a, b) => a - b)
      .map((h) => ({
        time: `${String(h).padStart(2, '0')}:00`,
        status: 'available' as const,
        currentCount: 0,
        maxCount: p.maxNumber ?? 0,
        price: p.pricePerHour ?? null,
      })),
  }));

  return (
    <div className="px-4">
      <h2 className="text-[20px] font-bold text-black mb-3">{await translate('community_hall_status')}</h2>
      <PracticeHallSchedule rooms={rooms} locale={locale} />
    </div>
  );
}
