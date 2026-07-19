'use client'

import React from "react";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { GetPaymentResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// startFull/endFull = 'YYYY-MM-DDTHH:mm' (KST, 자정 넘김은 endFull 날짜에 이미 반영됨)
// → customData용 KST ISO8601("...:00+09:00")로 변환.
const buildPracticeRoomInfo = (studioRoomId: number, startFull: string, endFull: string) => ({
  studioRoomId,
  startDate: `${startFull}:00+09:00`,
  endDate: `${endFull}:00+09:00`,
});

// 'YYYY-MM-DDTHH:mm' → 'HH:mm' (표시용)
const hhmm = (s: string) => s.split('T')[1] ?? s;
// 'YYYY-MM-DDTHH:mm' → 'YYYY.MM.DD'
const dotDate = (s: string) => (s.split('T')[0] ?? '').replace(/-/g, '.');
// 선택 구간을 '날짜 시작~종료'로. 종료가 다음날이면 종료 날짜도 표기.
const formatSelected = (start: string, end: string) => {
  const sd = dotDate(start);
  const ed = dotDate(end);
  return sd === ed ? `${sd} ${hhmm(start)} ~ ${hhmm(end)}` : `${sd} ${hhmm(start)} ~ ${ed} ${hhmm(end)}`;
};

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
  preStartTime,
  preEndTime,
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
  /** 커뮤니티 등에서 시간대까지 이미 골라 들어온 경우 — 시간 선택기 숨기고 이 값으로 바로 결제 */
  preStartTime?: string;
  preEndTime?: string;
}) => {
  // 연습실 결제는 시간대까지 이미 골라 들어온다(커뮤니티 등). 결제 페이지에선 시간 선택 없음.
  const selectedTime = preStartTime && preEndTime ? { startTime: preStartTime, endTime: preEndTime } : null;
  const room = payment.studioRoom;
  const myBookings = room?.myBookings ?? [];
  const date = room?.date;

  return (
    <>
      {/* 룸 대표 이미지 (히어로) — 웹 백버튼이 이 위에 얹힘 */}
      <div className="relative w-full aspect-[16/9] bg-[#F1F3F6]">
        {room?.imageUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.imageUrls[0]} alt={room?.name ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
              <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="10" r="2" stroke="#CDD1D5" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

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
              <div key={booking.id} className="px-3 py-1.5 bg-[#D5D5D5] rounded-lg">
                <span className="text-[12px] font-medium text-[#666]">
                  {booking.startDate.split(' ')[1] ?? booking.startDate} ~ {booking.endDate.split(' ')[1] ?? booking.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 시간 표시 (커뮤니티에서 미리 선택된 값) */}
      {selectedTime && (
        <div className="mx-5 mb-2 flex items-center justify-between bg-black rounded-xl px-4 py-3">
          <span className="text-[13px] text-white/60">{getLocaleString({ locale, key: 'time' })}</span>
          <span className="text-[14px] font-bold text-white">{formatSelected(selectedTime.startTime, selectedTime.endTime)}</span>
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
        practiceRoomInfo={selectedTime ? buildPracticeRoomInfo(studioRoomId, selectedTime.startTime, selectedTime.endTime) : undefined}
      />
    </>
  );
};
