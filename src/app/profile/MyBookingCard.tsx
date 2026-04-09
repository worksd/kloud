'use client'

import React, { useState } from "react";
import { RoomBookingDialog, RoomBookingInfo } from "@/app/components/RoomBookingDialog";
import { MyBookingResponse } from "@/app/endpoint/user.endpoint";
import { Locale } from "@/shared/StringResource";

export const MyBookingCard = ({ booking, locale }: {
  booking: MyBookingResponse;
  locale: Locale;
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const bookingInfo: RoomBookingInfo = {
    id: booking.id,
    roomName: booking.studioRoom?.name ?? '연습실',
    roomImageUrl: booking.studioRoom?.imageUrls?.[0],
    startDate: booking.startDate,
    endDate: booking.endDate,
  };

  return (
    <>
      <div
        onClick={() => setShowDialog(true)}
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

      {showDialog && (
        <RoomBookingDialog
          booking={bookingInfo}
          locale={locale}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
};
