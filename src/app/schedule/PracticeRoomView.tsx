'use client'

import React, { useState, useEffect, useCallback } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { getPracticeRoomsAction } from "@/app/schedule/get.practice.rooms.action";
import { StudioRoomResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

const getHeatColor = (current: number, max: number) => {
  if (current === 0) return '#F3F4F6';
  const ratio = current / max;
  if (ratio >= 0.8) return '#EF4444';
  if (ratio >= 0.6) return '#F59E0B';
  if (ratio >= 0.4) return '#818CF8';
  if (ratio >= 0.2) return '#A5B4FC';
  return '#C7D2FE';
};

const slotColor = (slot?: TimeSlotResponse) => {
  if (!slot || slot.status === 'closed') return '#F3F4F6';
  if (slot.status === 'full') return '#EF4444';
  return getHeatColor(slot.currentCount, slot.maxCount);
};

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDate = (d: Date, locale: Locale) => {
  const weekdays: Record<Locale, string[]> = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    jp: ['日', '月', '火', '水', '木', '金', '土'],
    zh: ['日', '一', '二', '三', '四', '五', '六'],
  };
  const wd = weekdays[locale][d.getDay()];
  if (locale === 'en') return `${d.getMonth() + 1}/${d.getDate()} (${wd})`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`;
};

export const PracticeRoomView = ({ selectedDate, onChangeDate, locale, studioId }: {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  studioId?: number;
  locale: Locale;
}) => {
  const [rooms, setRooms] = useState<StudioRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ room: StudioRoomResponse; slot: TimeSlotResponse } | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPracticeRoomsAction(toDateStr(selectedDate));
      if ('studioRooms' in res) {
        setRooms(res.studioRooms);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const allTimes = React.useMemo(() => {
    const timeSet = new Set<string>();
    rooms.forEach(room => room.slots?.forEach(s => {
      if (s.time.endsWith(':00')) timeSet.add(s.time);
    }));
    return Array.from(timeSet).sort();
  }, [rooms]);

  const handleSlotClick = (room: StudioRoomResponse, slot?: TimeSlotResponse) => {
    if (!slot || slot.status !== 'available') return;
    setSelectedSlot({ room, slot });
    kloudNav.push(KloudScreen.StudioRoomDetail(room.id, toDateStr(selectedDate), room.name));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-[#85898C] text-[15px] font-medium">
          {getLocaleString({ locale, key: 'no_practice_room' })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white pb-10">
      <div className="px-4 pt-3">
        <div className="border border-[#E6E8EA] rounded-2xl p-4">
          <span className="text-sm font-bold text-[#191F28]">{formatDate(selectedDate, locale)}</span>
          <div className="mt-3 flex gap-0.5">
            <div className="flex flex-col gap-0.5 pr-1 pt-[18px]">
              {allTimes.map((time) => (
                <div key={time} className="h-[22px] flex items-center justify-end">
                  <span className="text-[9px] text-[#9CA3AF] leading-none whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>
            {rooms.map((room) => (
              <div key={room.id} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-[#6D7882] font-bold h-[14px] truncate max-w-full">{room.name}</span>
                {allTimes.map((time) => {
                  const slot = room.slots?.find(s => s.time === time);
                  const isAvailable = slot?.status === 'available';
                  const isSelected = selectedSlot?.room.id === room.id && selectedSlot?.slot.time === time;
                  return (
                    <div
                      key={time}
                      onClick={() => handleSlotClick(room, slot)}
                      className={`w-full h-[22px] rounded-sm transition-all relative ${
                        isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
                      } ${isSelected ? 'z-10 rounded-md ring-2 ring-[#1E2124]' : ''}`}
                      style={{ backgroundColor: slotColor(slot) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'available' })}</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(v, 5) }} />
            ))}
            <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'crowded' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
