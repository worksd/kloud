'use client'

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useAlphaBg } from "@/app/home/HomeAlphaBg";

type JumbotronItem = {
  id: number;
  imageUrl: string;
}

export const Jumbotron = ({ items }: { items: JumbotronItem[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { setBgImage } = useAlphaBg();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? 0;
      if (cardWidth === 0) return;
      const index = Math.round(el.scrollLeft / (cardWidth + 8));
      setCurrent(index);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const newImage = items[current]?.imageUrl;
    if (newImage) setBgImage(newImage);
  }, [current, items, setBgImage]);

  if (items.length === 0) return null;

  return (
    <div className="relative py-1">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-2 snap-x snap-mandatory"
        style={{ paddingLeft: '20px', paddingRight: '20px' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-card
            className="flex-shrink-0 snap-center rounded-xl overflow-hidden bg-[#F1F3F6]"
            style={{ width: 'calc(100vw - 52px)', maxWidth: '338px', aspectRatio: '350/457' }}
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
          </div>
        ))}
      </div>

      {/* 페이지 인디케이터 */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-8 bg-black/60 rounded-xl px-2 py-1 flex items-center gap-0.5">
          <span className="text-white text-[12px] font-medium leading-4">{current + 1}</span>
          <span className="text-white/60 text-[12px] font-medium leading-4">|</span>
          <span className="text-white/60 text-[12px] font-medium leading-4">{items.length}</span>
        </div>
      )}
    </div>
  );
};
