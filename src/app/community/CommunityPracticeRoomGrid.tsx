'use client';

import React from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { CommunityStudioResponse } from "@/app/endpoint/community.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 커뮤니티 탭 — 연습실 전용 스튜디오 목록(2열 격자). 이름·주소 강조.
export const CommunityPracticeRoomGrid = ({ studios, locale }: { studios: CommunityStudioResponse[]; locale: Locale }) => {
  if (studios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-[#85898C] text-[15px] font-medium">{getLocaleString({ locale, key: 'community_no_studios' })}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-3 pb-10">
      {studios.map((room) => {
        return (
          <button
            key={room.id}
            onClick={() => kloudNav.push(`/community/${room.id}`)}
            className="flex flex-col text-left active:scale-[0.98] transition-transform"
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F1F3F6]">
              {room.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={room.imageUrl} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                    <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
                    <path d="M3 11H25" stroke="#CDD1D5" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>

            {/* 이름 — 강조 */}
            <span className="mt-2.5 text-[17px] font-bold text-[#171717] leading-tight line-clamp-1">
              {room.name}
            </span>

            {/* 주소 — 핀 아이콘 + 강조 */}
            <span className="mt-1 flex items-start gap-1 text-[13px] font-medium text-[#4E5968] leading-snug">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="mt-[2px] shrink-0">
                <path d="M12 21S5 14 5 9.5C5 5.91 8.13 3 12 3C15.87 3 19 5.91 19 9.5C19 14 12 21 12 21Z" stroke="#8A949E" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.2" stroke="#8A949E" strokeWidth="1.8" />
              </svg>
              <span className="line-clamp-2">{room.address}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
