'use client';

import React, { useRef, useState } from "react";

// 상단 대표 이미지 캐러셀 (가로 스와이프). 오른쪽 아래 현재/전체 인디케이터.
export function CommunityImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  if (!images.length) return <div className="w-full aspect-[4/3] bg-[#F1F3F6]" />;

  return (
    <div className="relative w-full aspect-[4/3] bg-[#F1F3F6]">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            className="w-full h-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-[12px] font-medium tabular-nums">
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
