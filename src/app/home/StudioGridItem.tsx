'use client'

import React from "react";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

// 추천 스튜디오 격자 카드 — 커버(없으면 프로필) 이미지 + 이름 + 주소. 탭 시 스튜디오 상세.
export const StudioGridItem = ({ item }: { item: GetStudioResponse }) => {
  const imageUrl = item.coverImageUrl ?? item.profileImageUrl;
  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.StudioDetail(item.id)}>
      <div className="flex flex-col text-left active:scale-[0.98] transition-transform duration-150">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#F1F3F6]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="5" width="22" height="18" rx="3" stroke="#CDD1D5" strokeWidth="1.5" />
                <path d="M3 17L9 12L14 16L19 11L25 17" stroke="#CDD1D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <span className="mt-2 text-[15px] font-bold text-[#171717] leading-tight line-clamp-2">{item.name}</span>
        {item.address && (
          <span className="mt-0.5 text-[12px] font-medium text-[#86898C] leading-snug line-clamp-1">{item.address}</span>
        )}
      </div>
    </NavigateClickWrapper>
  );
};
