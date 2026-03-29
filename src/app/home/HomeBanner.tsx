'use client'

import React from "react";
import Image from "next/image";
import { kloudNav } from "@/app/lib/kloudNav";

type BannerItem = {
  title: string;
  linkText: string;
  route: string;
  imageUrl?: string;
}

export const HomeBanner = ({ banner }: { banner: BannerItem }) => {
  return (
    <div
      className="mx-5 my-2 rounded-xl overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform"
      style={{ backgroundColor: '#BBE8ED', height: '80px' }}
      onClick={() => kloudNav.push(banner.route)}
    >
      {/* 텍스트 */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
        <span className="text-[14px] font-medium text-black">{banner.title}</span>
        <span className="text-[12px] font-medium text-black/60 flex items-center gap-0.5">
          {banner.linkText}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* 오른쪽 이미지 */}
      {banner.imageUrl && (
        <div className="absolute right-0 bottom-0 w-[118px] h-[110px]">
          <Image
            src={banner.imageUrl}
            alt=""
            width={118}
            height={110}
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
};
