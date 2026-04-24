'use client'

import React from "react";
import { MyBookingResponse } from "@/app/endpoint/user.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function parseBookingDate(raw: string) {
  const [datePart, timePart] = raw.split(' ');
  const [year, month, day] = (datePart ?? '').split('.').map(Number);
  const [hour, minute] = (timePart ?? '').split(':').map(Number);
  return { year, month, day, hour, minute };
}

function formatTime(hour: number, minute: number): string {
  const isPM = hour >= 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = isPM ? '오후' : '오전';
  return `${period} ${displayHour}:${String(minute).padStart(2, '0')}`;
}

function formatBookingRange(startRaw: string, endRaw: string): string {
  const s = parseBookingDate(startRaw);
  const e = parseBookingDate(endRaw);

  const sDate = new Date(s.year, s.month - 1, s.day);
  const sDayName = DAY_NAMES[sDate.getDay()];
  const sTime = formatTime(s.hour, s.minute);

  const eTime = formatTime(e.hour, e.minute);

  const sameDate = s.year === e.year && s.month === e.month && s.day === e.day;

  if (sameDate) {
    // 4/12 (일) 오전 10:00 ~ 오전 11:00
    return `${s.month}/${s.day} (${sDayName}) ${sTime} ~ ${eTime}`;
  }

  // 4/12 (일) 오후 11:00 ~ 4/13 (월) 오전 3:00
  const eDate = new Date(e.year, e.month - 1, e.day);
  const eDayName = DAY_NAMES[eDate.getDay()];
  return `${s.month}/${s.day} (${sDayName}) ${sTime} ~ ${e.month}/${e.day} (${eDayName}) ${eTime}`;
}

export const MyBookingCard = ({ booking }: {
  booking: MyBookingResponse;
}) => {
  // startDate: "2026.04.10 10:00" → "2026-04-10"
  const datePart = (booking.startDate.split(' ')[0] ?? '').replace(/\./g, '-');
  const roomId = booking.studioRoom?.id ?? booking.studioRoomId;

  return (
    <div
      onClick={() => kloudNav.push(KloudScreen.StudioRoomDetail(roomId, datePart))}
      className="rounded-2xl overflow-hidden bg-[#F7F8F9] active:scale-[0.98] transition-all duration-150 cursor-pointer"
    >
      <div className="w-full h-[100px] bg-[#E8E8EA]">
        {booking.studioRoom?.imageUrls?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={booking.studioRoom.imageUrls[0]} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex flex-col px-4 py-3 min-w-0">
        <span className="text-[14px] font-bold text-black truncate">{booking.studioRoom?.name ?? '연습실'}</span>
        <span className="text-[11px] text-[#86898C] mt-0.5">{formatBookingRange(booking.startDate, booking.endDate)}</span>
      </div>
    </div>
  );
};
