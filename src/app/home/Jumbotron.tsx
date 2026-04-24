'use client'

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useAlphaBg } from "@/app/home/HomeAlphaBg";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

type JumbotronItem = {
  id: number;
  imageUrl: string;
  title?: string;
  artistName?: string;
  artistImageUrl?: string;
}

export const Jumbotron = ({ items }: { items: JumbotronItem[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { setBgImage } = useAlphaBg();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const card = el.querySelector('[data-card]') as HTMLElement | null;
      if (!card) return;
      const gap = 12;
      const index = Math.round(el.scrollLeft / (card.clientWidth + gap));
      setCurrent(Math.min(Math.max(index, 0), items.length - 1));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  useEffect(() => {
    const newImage = items[current]?.imageUrl;
    if (newImage) setBgImage(newImage);
  }, [current, items, setBgImage]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col py-1">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory overscroll-x-contain"
        style={{ scrollPaddingLeft: '20px', scrollPaddingRight: '20px', gap: '12px', paddingLeft: '20px', paddingRight: '20px' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-card
            className="relative flex-shrink-0 snap-start rounded-xl overflow-hidden bg-[#F1F3F6] cursor-pointer active:scale-[0.98] transition-transform"
            style={{ width: 'calc(100vw - 40px)', aspectRatio: '350/457', scrollSnapStop: 'always' }}
            onClick={() => kloudNav.push(KloudScreen.LessonDetail(item.id))}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt=""
                width={350}
                height={457}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F1F3F6]" />
            )}

            {/* 하단 dim gradient + 수업/강사 정보 */}
            {(item.title || item.artistName) && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 flex flex-col gap-1.5">
                  {item.title && (
                    <span className="text-white text-[16px] font-bold leading-snug line-clamp-2">{item.title}</span>
                  )}
                  {item.artistName && (
                    <div className="flex items-center gap-2">
                      {item.artistImageUrl && (
                        <Image
                          src={item.artistImageUrl}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-white/70 text-[13px] font-medium">{item.artistName}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 페이지 인디케이터 */}
      {items.length > 1 && (
        <div className="flex justify-center mt-3 gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-[6px] rounded-full transition-all duration-200 ${
                i === current ? 'w-[18px] bg-black' : 'w-[6px] bg-black/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
