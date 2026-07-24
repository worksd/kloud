import React from "react";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { RoomSlotsSummaryResponse, StudioRoomResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { PracticeHallSchedule } from "@/app/studios/[id]/practice/PracticeHallSchedule";
import { Locale } from "@/shared/StringResource";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

// 앱 홈의 "오늘 연습실 예약" 섹션. 홈 응답 roomSlots(오늘 KST 방별 예약 가능 정시 목록)를 쓰고,
// 홀 이미지/가격/스펙 등 메타는 studio.practiceRooms에서 id로 조인한다.
// roomSlots가 없으면(스튜디오 없음 / 공개 홀 없음) 섹션 자체를 그리지 않는다.
// 카드 탭 시 시트 대신 스튜디오 상세로 이동(navigateStudioId) — 날짜 이동/상세 예약은 상세에서.
export async function HomeRoomSlotsSection({
  studioId,
  roomSlots,
  myBookings,
  practiceRooms,
  locale,
}: {
  studioId: number;
  roomSlots?: RoomSlotsSummaryResponse;
  myBookings?: { id: number; studioRoomId: number; roomName: string; startDate: string; endDate: string }[];
  practiceRooms?: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const rows = roomSlots?.rooms ?? [];
  const bookings = myBookings ?? [];
  if (rows.length === 0 && bookings.length === 0) return null; // undefined 가드 — 없으면 미표시

  // 'yyyy.MM.dd HH:mm' 파싱. 다가오는 예약은 여러 날짜에 걸쳐 오므로 날짜+시각을 표시.
  const parseDT = (s: string) => {
    const [datePart, timePart] = (s ?? '').split(' ');
    return { date: datePart ?? '', time: timePart ?? '' };
  };
  const dateLabel = (d: string) => {
    const [y, m, day] = d.split('.');
    if (!y || !m || !day) return d;
    return locale === 'ko' ? `${Number(m)}월 ${Number(day)}일` : `${m}.${day}`;
  };
  const fmtBooking = (startDate: string, endDate: string) => {
    const s = parseDT(startDate);
    const e = parseDT(endDate);
    const sameDay = s.date === e.date;
    return sameDay
      ? `${dateLabel(s.date)} ${s.time} ~ ${e.time}`
      : `${dateLabel(s.date)} ${s.time} ~ ${dateLabel(e.date)} ${e.time}`;
  };

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
    <section className="px-4 mt-6 flex flex-col gap-6">
      {/* 다가오는 예약 — 방 무관 flat 목록(섹션 레벨, 방 카드 내부 아님) */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-[20px] font-bold text-black mb-3">{await translate('home_upcoming_bookings')}</h2>
          <div className="flex flex-col gap-2">
            {bookings.map((b) => (
              <NavigateClickWrapper key={b.id} method="push" route={KloudScreen.RoomBookingDetail(b.id)}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#EEF0F2] px-4 py-3.5 cursor-pointer active:bg-[#FAFBFC] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#3CC0AF] shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[15px] font-bold text-[#171717]">{fmtBooking(b.startDate, b.endDate)}</span>
                    {b.roomName && <span className="mt-0.5 text-[12px] text-[#86898C] truncate">{b.roomName}</span>}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                    <path d="M9 6l6 6-6 6" stroke="#C4C9CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </NavigateClickWrapper>
            ))}
          </div>
        </div>
      )}

      {/* 오늘 연습실 예약 — 방별 예약 가능 시각 */}
      {rows.length > 0 && (
        <div>
          <h2 className="text-[20px] font-bold text-black mb-3">{await translate('home_today_room_status')}</h2>
          <PracticeHallSchedule rooms={rooms} locale={locale} navigateStudioId={studioId} />
        </div>
      )}
    </section>
  );
}
