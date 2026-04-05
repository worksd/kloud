'use client'

import React, { useState, useEffect, useCallback } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { getPracticeRoomsAction, getRoomAvailabilityAction } from "@/app/schedule/get.practice.rooms.action";
import { StudioRoomResponse, TimeSlotResponse, RoomAvailabilityResponse } from "@/app/endpoint/studio.room.endpoint";
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

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const PracticeRoomView = ({ selectedDate, onChangeDate, locale }: {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  locale: Locale;
}) => {
  const [rooms, setRooms] = useState<StudioRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ room: StudioRoomResponse; slot: TimeSlotResponse; } | null>(null);
  const [roomDetail, setRoomDetail] = useState<RoomAvailabilityResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [closingSlot, setClosingSlot] = useState(false);

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

  // 모든 room의 슬롯에서 정시(HH:00)만 추출
  const allTimes = React.useMemo(() => {
    const timeSet = new Set<string>();
    rooms.forEach(room => room.slots?.forEach(s => {
      if (s.time.endsWith(':00')) timeSet.add(s.time);
    }));
    return Array.from(timeSet).sort();
  }, [rooms]);

  useEffect(() => {
    if (closingSlot) {
      const timer = setTimeout(() => {
        setSelectedSlot(null);
        setClosingSlot(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [closingSlot]);

  const handleSlotClick = async (room: StudioRoomResponse, slot?: TimeSlotResponse) => {
    if (!slot || slot.status !== 'available') return;
    setSelectedSlot({ room, slot });
    setRoomDetail(null);
    setLoadingDetail(true);
    try {
      const res = await getRoomAvailabilityAction(room.id, toDateStr(selectedDate));
      if ('studioRoomId' in res) {
        setRoomDetail(res);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReserve = () => {
    if (!selectedSlot) return;
    setClosingSlot(true);
    setTimeout(() => {
      kloudNav.push(`/payment?item=practice-room&id=${selectedSlot.room.id}&date=${toDateStr(selectedDate)}&time=${selectedSlot.slot.time}&roomName=${encodeURIComponent(selectedSlot.room.name)}`);
    }, 150);
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
      {/* 히트맵 */}
      <div className="px-4 pt-3">
        <div className="border border-[#E6E8EA] rounded-2xl p-4">
          <span className="text-sm font-bold text-[#191F28]">{formatDate(selectedDate, locale)}</span>
          <div className="mt-3 flex gap-0.5">
            {/* 시간 라벨 */}
            <div className="flex flex-col gap-0.5 pr-1 pt-[18px]">
              {allTimes.map((time) => (
                <div key={time} className="h-[22px] flex items-center justify-end">
                  <span className="text-[9px] text-[#9CA3AF] leading-none whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>
            {/* 연습실별 격자 */}
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
                    >
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* 범례 */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'available' })}</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(v, 5) }} />
            ))}
            <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'crowded' })}</span>
          </div>
        </div>
      </div>

      {/* 선택된 슬롯 다이얼로그 */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setClosingSlot(true)}>
          <div className={`absolute inset-0 bg-black/40 ${closingSlot ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
          <div
            className={`relative bg-white rounded-2xl w-[calc(100%-48px)] max-w-[340px] ${closingSlot ? 'animate-[scaleOut_150ms_ease-in_forwards]' : 'animate-[scaleIn_150ms_ease-out]'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[17px] font-bold text-black">
                  {getLocaleString({ locale, key: 'reservation_info' })}
                </span>
                <button onClick={() => setClosingSlot(true)} className="p-1 -mr-1 active:opacity-50">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5L15 15M15 5L5 15" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5 text-[14px] mt-4">
                    <div className="flex justify-between">
                      <span className="text-[#888]">{getLocaleString({ locale, key: 'practice_room' })}</span>
                      <span className="font-semibold text-black">{roomDetail?.name ?? selectedSlot.room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888]">{getLocaleString({ locale, key: 'date' })}</span>
                      <span className="font-semibold text-black">{formatDate(selectedDate, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888]">{getLocaleString({ locale, key: 'time' })}</span>
                      <span className="font-semibold text-black">
                        {(() => {
                          const duration = roomDetail?.slotDurationMinutes ?? 60;
                          const [h, m] = selectedSlot.slot.time.split(':').map(Number);
                          const end = h * 60 + m + duration;
                          return `${selectedSlot.slot.time} ~ ${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888]">{getLocaleString({ locale, key: 'current_usage' })}</span>
                      <span className="font-semibold text-black">
                        {selectedSlot.slot.currentCount} / {roomDetail?.maxCount ?? selectedSlot.slot.maxCount}
                      </span>
                    </div>
                  </div>

                  {roomDetail?.buttons && roomDetail.buttons.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-5">
                      {roomDetail.buttons.map((btn, i) => (
                        <button
                          key={i}
                          disabled={!btn.route}
                          onClick={() => {
                            if (btn.route) {
                              setClosingSlot(true);
                              setTimeout(() => kloudNav.push(btn.route!), 150);
                            }
                          }}
                          className={`w-full py-3 rounded-xl text-[14px] font-bold transition-transform ${
                            btn.route
                              ? 'bg-black text-white active:scale-[0.98]'
                              : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                          }`}
                        >
                          {btn.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={handleReserve}
                      className="w-full mt-5 py-3 rounded-xl bg-black text-white text-[14px] font-bold active:scale-[0.98] transition-transform"
                    >
                      {getLocaleString({ locale, key: 'reserve' })}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
      `}</style>
    </div>
  );
};
