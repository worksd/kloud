// PC 전용 수업 페이지 horizontal scroll band.
// 다양한 variant 지원 — 포스터 비율 / 카드 크기로 시각 리듬 차별화.

import React from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";

export type BandLessonItem = {
  id: number;
  title: string;
  subtitle: string; // studio · artist 등
  imageUrl: string;
  genre?: string;
};

type BandVariant = 'poster' | 'square' | 'wide';

export const LessonsPcBand = ({
  title,
  subtitle,
  items,
  variant = 'poster',
}: {
  title: string;
  subtitle?: string;
  items: BandLessonItem[];
  variant?: BandVariant;
}) => {

  // variant별 카드 폭 / 비율
  const cardConfig: Record<BandVariant, { cardClass: string; aspect: string; titleSize: string }> = {
    poster: { cardClass: 'w-[200px]', aspect: 'aspect-[3/4]', titleSize: 'text-[14px]' },
    square: { cardClass: 'w-[220px]', aspect: 'aspect-square', titleSize: 'text-[14px]' },
    wide:   { cardClass: 'w-[320px]', aspect: 'aspect-[16/9]', titleSize: 'text-[15px]' },
  };
  const cfg = cardConfig[variant];

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-[#86898C]">{subtitle}</p>}
        </div>
      </div>
      <div className="flex overflow-x-auto scrollbar-hide gap-4 -mx-1 px-1 snap-x">
        {items.map((item) => (
          <Link
            key={item.id}
            href={KloudScreen.LessonDetail(item.id)}
            className={`${cfg.cardClass} flex-none snap-start flex flex-col gap-2.5 group`}
          >
            <div className={`relative w-full ${cfg.aspect} rounded-2xl overflow-hidden bg-[#F1F3F6]`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {item.genre && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                  <span className="text-[11px] font-semibold text-white">{item.genre}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`${cfg.titleSize} font-bold text-black truncate`}>{item.title}</span>
              <span className="text-[12px] text-[#86898C] truncate">{item.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
