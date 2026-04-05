'use client'

import React, { useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { RoomAvailabilityResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
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

const statusLabel = (status: string, locale: Locale) => {
  switch (status) {
    case 'available': return getLocaleString({ locale, key: 'available' });
    case 'full': return getLocaleString({ locale, key: 'crowded' });
    case 'closed': return getLocaleString({ locale, key: 'closed' });
    default: return status;
  }
};

const calcEndTime = (time: string, duration: number) => {
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + duration;
  return `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

const toTargetDate = (date: string) => date.replace(/-/g, '.');

export const StudioRoomDetailClient = ({ room, date, locale }: {
  room: RoomAvailabilityResponse;
  date: string;
  locale: Locale;
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotResponse | null>(null);
  const hourlySlots = room.slots.filter(s => s.time.endsWith(':00'));

  const handleReserve = () => {
    if (!selectedSlot) return;
    const endTime = calcEndTime(selectedSlot.time, room.slotDurationMinutes);
    kloudNav.push(`/payment?item=practice-room&id=${room.studioRoomId}&targetDate=${toTargetDate(date)}&startTime=${selectedSlot.time}&endTime=${endTime}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <div className="px-6 pt-5 pb-4">
        <h1 className="text-[22px] font-bold text-black">{room.name}</h1>
        <span className="text-[14px] text-[#86898C] mt-1">{date}</span>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[13px] text-[#86898C]">
            {getLocaleString({ locale, key: 'max_capacity' })}: {room.maxCount}{getLocaleString({ locale, key: 'people' })}
          </span>
          <span className="text-[13px] text-[#86898C]">
            {room.slotDurationMinutes}{getLocaleString({ locale, key: 'minutes' })}/{getLocaleString({ locale, key: 'slot' })}
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-[#F7F8F9]" />

      {/* 시간대 목록 */}
      <div className="px-6 pt-4">
        <h2 className="text-[15px] font-bold text-black mb-3">{getLocaleString({ locale, key: 'time' })}</h2>
        <div className="flex flex-col gap-2">
          {hourlySlots.map((slot) => {
            const isAvailable = slot.status === 'available';
            const isSelected = selectedSlot?.time === slot.time;
            const endTime = calcEndTime(slot.time, room.slotDurationMinutes);

            return (
              <div
                key={slot.time}
                onClick={() => isAvailable && setSelectedSlot(isSelected ? null : slot)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all
                  ${!isAvailable
                    ? 'border-[#F0F0F0] bg-[#FAFAFA] opacity-40 cursor-not-allowed'
                    : isSelected
                      ? 'border-black bg-black'
                      : 'border-[#E8E8E8] bg-white cursor-pointer active:scale-[0.98]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slotColor(slot) }}
                  />
                  <span className={`text-[15px] font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                    {slot.time} ~ {endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] ${isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                    {slot.currentCount}/{slot.maxCount}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    slot.status === 'available'
                      ? isSelected ? 'bg-white/20 text-white' : 'bg-[#ECFDF5] text-[#059669]'
                      : slot.status === 'full'
                        ? 'bg-[#FEF2F2] text-[#EF4444]'
                        : 'bg-[#F3F4F6] text-[#999]'
                  }`}>
                    {statusLabel(slot.status, locale)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* buttons */}
      {room.buttons && room.buttons.length > 0 && (
        <div className="px-6 pt-4">
          <div className="flex flex-col gap-2">
            {room.buttons.map((btn, i) => (
              <button
                key={i}
                disabled={!btn.route}
                onClick={() => btn.route && kloudNav.push(btn.route)}
                className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-transform ${
                  btn.route
                    ? 'bg-[#F3F4F6] text-black active:scale-[0.98]'
                    : 'bg-[#F3F4F6] text-[#999] cursor-not-allowed'
                }`}
              >
                {btn.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 하단 예약 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white">
        <button
          disabled={!selectedSlot}
          onClick={handleReserve}
          className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all ${
            selectedSlot
              ? 'bg-black text-white active:scale-[0.98]'
              : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
          }`}
        >
          {selectedSlot
            ? `${selectedSlot.time} ${getLocaleString({ locale, key: 'reserve' })}`
            : getLocaleString({ locale, key: 'select_time' })}
        </button>
      </div>
    </div>
  );
};
