'use client'

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { kloudNav } from "@/app/lib/kloudNav";

/** 홈 배너(HomeBannerResponse)·스튜디오 배너(StudioBannerResponse) 공통 모양 — endDate 는 스튜디오 배너에만 */
export type BannerItem = {
  id: number;
  imageUrl: string;
  description?: string;
  route: string;
  endDate?: string;
};

/**
 * 공용 배너 캐러셀 — 모바일 홈·스튜디오 상세(모바일/PC) 세 곳이 같은 컴포넌트를 쓴다 (2026-10-21).
 * 전까지는 세 곳이 각자 가로 스크롤 + 이미지 한 장이라 비율·모서리가 제각각이었고 몇 장인지도 알 수 없었다.
 *
 *  - 비율 32:9 · 모서리 16px 로 통일. 이미지 아래쪽에 옅은 그라디언트와 안쪽 1px 테두리를 얹어 사진이 거칠어도 카드처럼 정돈되게.
 *  - 2장 이상이면 무한 루프 + 자동 넘김(4.5초). 손으로 넘긴 뒤에도 자동 넘김은 이어지고, PC 는 마우스를 올리면 멈춘다.
 *  - 우하단 '1 / 3' 카운터로 몇 장인지 보여준다. 1장이면 숨김.
 *  - inset(px) 을 주면 양옆 여백 자리에 옆 배너가 살짝 보여(peek) 넘길 수 있다는 힌트가 된다 — 모바일 전용.
 *  - endDate 가 지난 배너는 거르고, 전부 지났으면 아무것도 그리지 않는다.
 *  - 이미지 위에 글자(description)는 얹지 않는다 — 스튜디오가 올리는 배너 이미지에 이미 문구가 들어있는 경우가 많아 중복된다. alt 로만 쓴다.
 */
export const BannerCarousel = ({ banners, inset = 0, sizes = '100vw', className = '' }: {
  banners: BannerItem[];
  /** 양옆 여백(px). 이 여백 자리에 옆 배너가 살짝 보인다. 0 이면 부모 폭을 꽉 채운다 */
  inset?: number;
  /** next/image sizes — PC 처럼 폭이 정해진 컬럼이면 넘긴다 */
  sizes?: string;
  className?: string;
}) => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const now = Date.now();
  const items = banners.filter(b => !b.endDate || new Date(b.endDate).getTime() >= now);
  const count = items.length;
  if (count === 0) return null;
  const multiple = count > 1;

  const go = (route: string) => {
    if (typeof window !== 'undefined' && window.KloudEvent) kloudNav.push(route);
    else router.push(route);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Swiper
        modules={[Autoplay]}
        style={{ marginLeft: inset, marginRight: inset, overflow: 'visible' }}
        slidesPerView={1}
        spaceBetween={inset > 0 ? 10 : 12}
        loop={multiple}
        grabCursor
        autoplay={multiple ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        onSlideChange={(s) => setCurrent(s.realIndex)}
      >
        {items.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              role="button"
              aria-label={banner.description || undefined}
              onClick={() => go(banner.route)}
              className="relative w-full aspect-[32/9] rounded-2xl overflow-hidden bg-[#F2F3F5] cursor-pointer active:scale-[0.985] transition-transform duration-200"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.description ?? ''}
                fill
                sizes={sizes}
                className="object-cover"
              />
              {/* 아래쪽 그라디언트 — 카운터 가독성 + 밝은 사진의 바닥 마감 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
              {/* 안쪽 1px 테두리 — 흰 배경 위 밝은 이미지의 경계가 흐려지지 않게 */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 페이지 카운터 — 현재 보이는 배너의 우하단. inset 만큼 안쪽으로 */}
      {multiple && (
        <div
          className="pointer-events-none absolute bottom-2.5 rounded-full bg-black/40 backdrop-blur-[2px] px-2 py-[3px] text-[11px] font-semibold leading-none text-white tabular-nums"
          style={{ right: inset + 10 }}
        >
          {current + 1} / {count}
        </div>
      )}
    </div>
  );
};
