'use client'

import React, { useState } from "react";
import { PracticeRoomSlotSelector } from "@/app/payment/PracticeRoomSlotSelector";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const PracticeRoomPaymentWrapper = ({
  payment,
  studioRoomId,
  url,
  appVersion,
  os,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment,
  locale,
}: {
  payment: GetPaymentResponse;
  studioRoomId: number;
  url: string;
  appVersion: string;
  os?: string;
  beforeDepositor: string;
  actualPayerUserId?: number;
  isProxyPayment?: boolean;
  locale: Locale;
}) => {
  const [selectedTime, setSelectedTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const room = payment.studioRoom;
  const slots = payment.slots ?? [];
  const myBookings = payment.myBookings ?? [];
  const date = payment.date;

  return (
    <>
      {/* 룸 정보 */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[48px] h-[48px] rounded-2xl bg-[#F1F3F6] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#333" strokeWidth="1.5"/>
              <path d="M8 5V3" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 5V3" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 9H21" stroke="#333" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[18px] font-bold text-black">
              {room?.name ?? getLocaleString({ locale, key: 'practice_room' })}
            </span>
          </div>
        </div>
        {date && (
          <div className="flex items-center justify-between bg-[#F7F8F9] rounded-xl px-4 py-3">
            <span className="text-[13px] text-[#86898C]">{getLocaleString({ locale, key: 'date' })}</span>
            <span className="text-[14px] font-medium text-black">{date}</span>
          </div>
        )}
      </div>

      {/* 내 기존 예약 */}
      {myBookings.length > 0 && (
        <div className="px-5 pb-2">
          <span className="text-[13px] font-bold text-black mb-2 block">
            {getLocaleString({ locale, key: 'my_bookings' })}
          </span>
          <div className="flex flex-wrap gap-2">
            {myBookings.map((booking) => (
              <div key={booking.id} className="px-3 py-1.5 bg-[#EDEDFF] rounded-lg">
                <span className="text-[12px] font-medium text-[#5B5FF6]">
                  {booking.startTime} ~ {booking.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시간대 선택 */}
      {slots.length > 0 && (
        <PracticeRoomSlotSelector
          slots={slots}
          slotDurationMinutes={room?.slotDurationMinutes ?? 60}
          locale={locale}
          myBookings={myBookings}
          onSelectionChange={setSelectedTime}
        />
      )}

      {/* 선택된 시간 표시 */}
      {selectedTime && (
        <div className="mx-5 mb-2 flex items-center justify-between bg-black rounded-xl px-4 py-3">
          <span className="text-[13px] text-white/60">{getLocaleString({ locale, key: 'time' })}</span>
          <span className="text-[14px] font-bold text-white">{selectedTime.startTime} ~ {selectedTime.endTime}</span>
        </div>
      )}

      <div className="py-1">
        <div className="w-full h-2 bg-[#F7F8F9]" />
      </div>

      <UnifiedPaymentInfo
        type="practice-room"
        url={url}
        appVersion={appVersion}
        os={os}
        payment={payment}
        beforeDepositor={beforeDepositor}
        locale={locale}
        actualPayerUserId={actualPayerUserId}
        isProxyPayment={isProxyPayment}
        practiceRoomInfo={selectedTime ? {
          studioRoomId,
          targetDate: date ?? '',
          startTime: selectedTime.startTime,
          endTime: selectedTime.endTime,
        } : undefined}
      />
    </>
  );
};
