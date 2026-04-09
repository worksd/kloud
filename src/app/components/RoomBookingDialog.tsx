'use client'

import React from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export type RoomBookingInfo = {
  id: number;
  roomName: string;
  roomImageUrl?: string;
  startDate: string;
  endDate: string;
}

export const RoomBookingDialog = ({
  booking,
  locale,
  onClose,
  onCancel,
}: {
  booking: RoomBookingInfo;
  locale: Locale;
  onClose: () => void;
  onCancel?: (bookingId: number) => void;
}) => {
  const [closing, setClosing] = React.useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 150);
  };

  const handleCancel = () => {
    if (onCancel) {
      setClosing(true);
      setTimeout(() => onCancel(booking.id), 150);
    }
  };

  // startDate: "2026.04.10 10:00", endDate: "2026.04.10 11:00"
  const datePart = booking.startDate.split(' ')[0] ?? '';
  const startTime = booking.startDate.split(' ')[1] ?? '';
  const endTime = booking.endDate.split(' ')[1] ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/40 ${closing ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
      <div
        className={`relative bg-white rounded-2xl w-[calc(100%-48px)] max-w-[340px] overflow-hidden ${closing ? 'animate-[scaleOut_150ms_ease-in_forwards]' : 'animate-[scaleIn_150ms_ease-out]'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 이미지 */}
        <div className="w-full h-[120px] bg-[#F1F3F6]">
          {booking.roomImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booking.roomImageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* 정보 */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[17px] font-bold text-black">{booking.roomName}</h3>
            <button onClick={handleClose} className="p-1 -mr-1 active:opacity-50">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-[#86898C]">{getLocaleString({ locale, key: 'date' })}</span>
              <span className="font-medium text-black">{datePart}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86898C]">{getLocaleString({ locale, key: 'time' })}</span>
              <span className="font-medium text-black">{startTime} ~ {endTime}</span>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={handleCancel}
              className="w-full mt-4 py-3 rounded-xl border border-[#EF4444] text-[#EF4444] text-[14px] font-bold active:scale-[0.98] transition-transform"
            >
              {getLocaleString({ locale, key: 'cancel_booking' })}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
      `}</style>
    </div>
  );
};
