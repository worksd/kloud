'use client'

import React, { useState, useCallback } from "react";
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
  slotDurationMinutes,
  locale,
  myBookings,
  onSelectionChange,
}: {
  slots: TimeSlotResponse[];
  slotDurationMinutes: number;
  locale: Locale;
  myBookings?: { id: number; startTime: string; endTime: string }[];
  onSelectionChange: (selection: { startTime: string; endTime: string } | null) => void;
}) => {
  const hourlySlots = slots.filter(s => s.time.endsWith(':00'));

  const isMyBooked = (time: string) =>
    (myBookings ?? []).some(b => b.startTime <= time && time < b.endTime);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const handleSlotClick = (index: number) => {
    const slot = hourlySlots[index];
    if (slot.status !== 'available' || isMyBooked(slot.time)) return;

    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }

    // 연속된 범위인지 확인
    if (newSet.size > 0) {
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
    }

    setSelectedIndices(newSet);

    if (newSet.size > 0) {
      const sorted = Array.from(newSet).sort((a, b) => a - b);
      const startTime = hourlySlots[sorted[0]].time;
      const endTime = calcEndTime(hourlySlots[sorted[sorted.length - 1]].time, slotDurationMinutes);
      onSelectionChange({ startTime, endTime });
    } else {
      onSelectionChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 px-5 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-bold text-black">
          {getLocaleString({ locale, key: 'select_time' })}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'available' })}</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <div key={v} className="w-2 h-2 rounded-sm" style={{ backgroundColor: getHeatColor(v, 5) }} />
          ))}
          <span className="text-[9px] text-[#9CA3AF]">{getLocaleString({ locale, key: 'crowded' })}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {hourlySlots.map((slot, index) => {
          const isAvailable = slot.status === 'available';
          const isSelected = selectedIndices.has(index);
          const booked = isMyBooked(slot.time);

          return (
            <button
              key={slot.time}
              disabled={!isAvailable || booked}
              onClick={() => handleSlotClick(index)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all
                ${booked
                  ? 'border-[#5B5FF6]/30 bg-[#EDEDFF] text-[#5B5FF6] cursor-not-allowed'
                  : !isAvailable
                    ? 'border-[#F0F0F0] bg-[#FAFAFA] text-[#CCC] cursor-not-allowed'
                    : isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-[#E8E8E8] bg-white text-black active:scale-[0.97]'
                }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: booked ? '#5B5FF6' : isSelected ? '#fff' : slotColor(slot) }}
              />
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};
