'use client'

import React, { useState, useRef, useEffect } from "react";
import { TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
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

const slotColor = (slot: TimeSlotResponse) => {
  if (slot.status === 'closed') return '#F3F4F6';
  if (slot.status === 'full') return '#EF4444';
  return getHeatColor(slot.currentCount, slot.maxCount);
};

const calcEndTime = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + duration;
  return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

export const PracticeRoomSlotSelector = ({
  slots,
  minBookingDuration,
  maxBookingDuration,
  dailyBookingLimit,
  locale,
  myBookings,
  onSelectionChange,
}: {
  slots: TimeSlotResponse[];
  minBookingDuration: number;
  maxBookingDuration?: number | null;
  dailyBookingLimit?: number | null;
  locale: Locale;
  myBookings?: { id: number; startDate: string; endDate: string }[];
  onSelectionChange: (selection: { startTime: string; endTime: string } | null) => void;
}) => {
  const filteredSlots = slots.filter(s => {
    const [, m] = s.time.split(':').map(Number);
    return m % minBookingDuration === 0;
  });

  const isMyBooked = (time: string) =>
    (myBookings ?? []).some(b => {
      const bStart = b.startDate.split(' ')[1] ?? '';
      const bEnd = b.endDate.split(' ')[1] ?? '';
      return time >= bStart && time < bEnd;
    });

  const myBookedMinutes = (myBookings ?? []).reduce((sum, b) => {
    const bStart = b.startDate.split(' ')[1] ?? '0:0';
    const bEnd = b.endDate.split(' ')[1] ?? '0:0';
    const [sh, sm] = bStart.split(':').map(Number);
    const [eh, em] = bEnd.split(':').map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstAvailableIndex = filteredSlots.findIndex(s => s.status === 'available' && !isMyBooked(s.time));
    if (firstAvailableIndex >= 0 && scrollRef.current) {
      const scrollLeft = firstAvailableIndex * 48 - scrollRef.current.clientWidth / 2 + 24;
      scrollRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [filteredSlots]);

  const maxSlots = maxBookingDuration
    ? Math.floor(maxBookingDuration / minBookingDuration)
    : null;

  const dailyRemainingSlots = dailyBookingLimit
    ? Math.floor((dailyBookingLimit - myBookedMinutes) / minBookingDuration)
    : null;

  const effectiveMaxSlots = Math.min(
    maxSlots ?? Infinity,
    dailyRemainingSlots ?? Infinity,
  );

  const applySelection = (newSet: Set<number>) => {
    setSelectedIndices(newSet);
    if (newSet.size > 0) {
      const sorted = Array.from(newSet).sort((a, b) => a - b);
      const startTime = filteredSlots[sorted[0]].time;
      const endTime = calcEndTime(filteredSlots[sorted[sorted.length - 1]].time, minBookingDuration);
      onSelectionChange({ startTime, endTime });
    } else {
      onSelectionChange(null);
    }
  };

  const handleClick = (index: number) => {
    const slot = filteredSlots[index];
    if (slot.status !== 'available' || isMyBooked(slot.time)) return;

    const newSet = new Set(selectedIndices);

    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);

      // 연속 체크 — 비연속이면 새로 클릭한 것만
      const sorted = Array.from(newSet).sort((a, b) => a - b);
      let isConsecutive = true;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          isConsecutive = false;
          break;
        }
      }
      if (!isConsecutive) {
        newSet.clear();
        newSet.add(index);
      }

      // max 초과 시 가장 먼저 선택된 슬롯부터 제거
      while (effectiveMaxSlots !== Infinity && newSet.size > effectiveMaxSlots) {
        const first = Array.from(newSet).sort((a, b) => a - b)[0];
        newSet.delete(first);
      }
    }

    applySelection(newSet);
  };

  return (
    <div className="flex flex-col gap-1.5 px-5 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-bold text-black">
          {getLocaleString({ locale, key: 'select_time' })}
        </span>
        {effectiveMaxSlots !== Infinity && (
          <span className="text-[11px] text-[#86898C]">
            {getLocaleString({ locale, key: 'max_booking' })} {effectiveMaxSlots * minBookingDuration}{getLocaleString({ locale, key: 'minutes' })}
          </span>
        )}
      </div>

      {/* 가로 히트맵 */}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-0.5" style={{ minWidth: `${filteredSlots.length * 48}px` }}>
          {filteredSlots.map((slot, index) => {
            const isAvailable = slot.status === 'available';
            const isSelected = selectedIndices.has(index);
            const booked = isMyBooked(slot.time);
            return (
              <div
                key={slot.time}
                onClick={() => handleClick(index)}
                className={`w-[46px] flex-shrink-0 flex flex-col items-center justify-center h-[48px] rounded-md select-none transition-all ${
                  booked
                    ? 'bg-[#E8E8E8]'
                    : !isAvailable
                      ? 'bg-[#F0F0F0]'
                      : isSelected
                        ? 'bg-[#1E2124] active:scale-95'
                        : 'cursor-pointer active:scale-95'
                }`}
                style={!booked && isAvailable && !isSelected ? { backgroundColor: slotColor(slot) } : undefined}
              >
                <span className={`text-[10px] font-bold ${
                  booked ? 'text-[#BFBFBF]' : !isAvailable ? 'text-[#CCC]' : isSelected ? 'text-white' : 'text-[#555]'
                }`}>
                  {slot.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택 시간 표시 */}
      {selectedIndices.size > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-[13px] text-black font-bold">
            {filteredSlots[Array.from(selectedIndices).sort((a, b) => a - b)[0]]?.time} ~ {calcEndTime(filteredSlots[Array.from(selectedIndices).sort((a, b) => a - b).pop()!]?.time, minBookingDuration)}
          </span>
          <span className="text-[12px] text-[#86898C]">
            {selectedIndices.size * minBookingDuration}{getLocaleString({ locale, key: 'minutes' })}
          </span>
        </div>
      )}
    </div>
  );
};
