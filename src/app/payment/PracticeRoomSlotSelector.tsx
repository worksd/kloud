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
  bookingDurationMinutes,
  locale,
  onSelectionChange,
}: {
  slots: TimeSlotResponse[];
  slotDurationMinutes: number;
  bookingDurationMinutes?: number | null;
  locale: Locale;
  onSelectionChange: (selection: { startTime: string; endTime: string } | null) => void;
}) => {
  const hourlySlots = slots.filter(s => s.time.endsWith(':00'));
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // 고정 예약 시간이면 한번에 선택되는 슬롯 수
  const fixedCount = bookingDurationMinutes
    ? Math.ceil(bookingDurationMinutes / slotDurationMinutes)
    : 1;

  const isConsecutiveAvailable = useCallback((startIdx: number, count: number) => {
    for (let i = startIdx; i < startIdx + count && i < hourlySlots.length; i++) {
      if (hourlySlots[i].status !== 'available') return false;
    }
    return startIdx + count <= hourlySlots.length;
  }, [hourlySlots]);

  const handleSlotClick = (index: number) => {
    if (hourlySlots[index].status !== 'available') return;

    if (bookingDurationMinutes) {
      // 고정 시간: 클릭하면 해당 위치부터 fixedCount만큼 선택/해제
      if (!isConsecutiveAvailable(index, fixedCount)) return;

      const newSet = new Set<number>();
      // 이미 같은 시작점이 선택되어 있으면 해제
      if (selectedIndices.has(index) && selectedIndices.size === fixedCount) {
        setSelectedIndices(newSet);
        onSelectionChange(null);
      } else {
        for (let i = index; i < index + fixedCount; i++) newSet.add(i);
        setSelectedIndices(newSet);
        const startTime = hourlySlots[index].time;
        const endTime = calcEndTime(hourlySlots[index + fixedCount - 1].time, slotDurationMinutes);
        onSelectionChange({ startTime, endTime });
      }
    } else {
      // 자유 선택: 토글
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
          // 비연속이면 새로 클릭한 것만 선택
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
          const endTime = calcEndTime(slot.time, slotDurationMinutes);

          return (
            <button
              key={slot.time}
              disabled={!isAvailable}
              onClick={() => handleSlotClick(index)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all
                ${!isAvailable
                  ? 'border-[#F0F0F0] bg-[#FAFAFA] text-[#CCC] cursor-not-allowed'
                  : isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-[#E8E8E8] bg-white text-black active:scale-[0.97]'
                }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: isSelected ? '#fff' : slotColor(slot) }}
              />
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};
