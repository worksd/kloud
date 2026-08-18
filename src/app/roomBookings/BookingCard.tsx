'use client'

// 대관 내역 카드 + 예정/지난 분류 유틸 — 대관 목록 페이지와 PC 프로필 탭이 공유한다.

import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { StringResourceKey } from "@/shared/StringResource";

export const BOOKING_STATUS: Record<RoomBookingDetailResponse['status'], { key: StringResourceKey; cls: string }> = {
  Active: { key: 'room_booking_status_active', cls: 'bg-[#EAF7F4] text-[#2AA894]' },
  Pending: { key: 'room_booking_status_pending', cls: 'bg-[#FFF4E5] text-[#E09400]' },
  Used: { key: 'room_booking_status_used', cls: 'bg-[#F1F3F6] text-[#6d7882]' },
  Cancelled: { key: 'room_booking_status_cancelled', cls: 'bg-[#FDECEC] text-[#E5484D]' },
};

// 'yyyy.MM.dd HH:mm' (KST 벽시계) → 정렬·비교용 숫자 202607272200. 파싱 실패 시 0.
export const bookingDateKey = (s?: string) => Number((s ?? '').replace(/\D/g, '').slice(0, 12)) || 0;
// 현재 시각을 KST 벽시계 기준 같은 12자리 숫자로. (서버 타임존과 무관하게 비교)
export const bookingNowKey = () => Number(
  new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(/\D/g, '').slice(0, 12)
);

export const BookingCard = ({
  b,
  practiceRoomLabel,
  statusText,
}: {
  b: RoomBookingDetailResponse;
  practiceRoomLabel: string;
  statusText: Record<RoomBookingDetailResponse['status'], string>;
}) => {
  const s = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.Active;
  const image = b.studioRoom?.imageUrls?.[0];
  return (
    <NavigateClickWrapper method="push" route={KloudScreen.RoomBookingDetail(b.id)}>
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#EEF0F2] hover:bg-[#FAFBFC] active:bg-[#FAFBFC] cursor-pointer transition-colors">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0 flex items-center justify-center">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
              <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {b.studio && (
            <div className="flex items-center gap-1.5 mb-1">
              {b.studio.profileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.studio.profileImageUrl} alt={b.studio.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
              )}
              <span className="text-[12px] font-medium text-[#8B95A1] truncate">{b.studio.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-[#191f28] truncate">{b.studioRoom?.name ?? practiceRoomLabel}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${s.cls}`}>{statusText[b.status] ?? statusText.Active}</span>
          </div>
          <p className="mt-1 text-[13px] text-[#6d7882] truncate">{b.startDate} ~ {b.endDate}</p>
        </div>
      </div>
    </NavigateClickWrapper>
  );
};
