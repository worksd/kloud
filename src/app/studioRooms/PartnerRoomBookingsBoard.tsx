'use client'

import React, { useEffect, useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { CommunityPracticeRoomResponse } from "@/app/endpoint/studio.endpoint";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { getRoomBookingsByRoomAction } from "@/app/studioRooms/get.room.bookings.action";

const STATUS: Record<RoomBookingDetailResponse['status'], { key: Parameters<typeof getLocaleString>[0]['key']; cls: string }> = {
  Active: { key: 'room_booking_status_active', cls: 'bg-[#EAF7F4] text-[#2AA894]' },
  Pending: { key: 'room_booking_status_pending', cls: 'bg-[#FFF4E5] text-[#E09400]' },
  Used: { key: 'room_booking_status_used', cls: 'bg-[#F1F3F6] text-[#6d7882]' },
  Cancelled: { key: 'room_booking_status_cancelled', cls: 'bg-[#FDECEC] text-[#E5484D]' },
};

// 파트너 예약일정표. studio.practiceRooms로 홀 셀렉터 → 선택 홀의 roomBookings 목록.
export function PartnerRoomBookingsBoard({
  practiceRooms,
  locale,
}: {
  practiceRooms: CommunityPracticeRoomResponse[];
  locale: Locale;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [selectedId, setSelectedId] = useState<number | null>(practiceRooms[0]?.id ?? null);
  const [bookings, setBookings] = useState<RoomBookingDetailResponse[] | null>(null); // null=로딩중
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedId == null) return;
    let alive = true;
    setLoading(true);
    setBookings(null);
    getRoomBookingsByRoomAction({ studioRoomId: selectedId })
      .then((res) => {
        if (!alive) return;
        setBookings(('roomBookings' in res) ? res.roomBookings : []);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [selectedId]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* 홀 셀렉터 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 border-b border-[#F1F3F6] [&>*:last-child]:mr-4">
        {practiceRooms.map((room) => {
          const selected = room.id === selectedId;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedId(room.id)}
              className={`shrink-0 px-3.5 h-9 rounded-full text-[14px] font-bold transition-colors ${
                selected ? 'bg-[#171717] text-white' : 'bg-[#F1F3F6] text-[#4E5968] active:bg-[#E7EAEE]'
              }`}
            >
              {room.name}
            </button>
          );
        })}
      </div>

      {/* 예약 목록 */}
      {loading || bookings == null ? (
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="w-7 h-7 border-2 border-[#E4E8EC] border-t-[#171717] rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="py-24 text-center text-[14px] text-[#A0A5AB]">{t('room_bookings_empty')}</p>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 py-4">
          {bookings.map((b) => {
            const s = STATUS[b.status] ?? STATUS.Active;
            const who = b.user?.name ?? b.name ?? '-';
            return (
              <button
                key={b.id}
                onClick={() => kloudNav.push(KloudScreen.RoomBookingDetail(b.id))}
                className="text-left p-3 rounded-2xl border border-[#EEF0F2] active:bg-[#FAFBFC] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-[#191f28] truncate">{who}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${s.cls}`}>{t(s.key)}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F3F6] text-[#6d7882] shrink-0">
                    {t(b.type === 'full' ? 'room_booking_type_full' : 'room_booking_type_individual')}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6d7882]">{b.startDate} ~ {b.endDate}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
