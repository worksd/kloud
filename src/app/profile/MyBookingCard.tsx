'use client'

import React from "react";
import { MyBookingResponse } from "@/app/endpoint/user.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

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
        <span className="text-[11px] text-[#86898C] mt-0.5">{booking.startDate} ~ {booking.endDate}</span>
      </div>
    </div>
  );
};
