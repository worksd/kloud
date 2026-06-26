'use client'

import React from "react";
import Image from "next/image";
import { kloudNav } from "@/app/lib/kloudNav";
import { HomeBannerResponse } from "@/app/endpoint/studio.endpoint";

export const HomeBanner = ({ banners }: { banners: HomeBannerResponse[] }) => {
  if (banners.length === 0) return null;

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 px-5 py-2 snap-x snap-mandatory">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="flex-shrink-0 snap-center rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform relative"
          style={{ width: banners.length === 1 ? '100%' : 'calc(100vw - 52px)', height: '96px' }}
          onClick={() => kloudNav.push(banner.route)}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.description ?? ''}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};
