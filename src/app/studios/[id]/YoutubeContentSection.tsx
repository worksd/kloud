'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { YoutubePreview } from "@/app/components/YoutubePreview";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type YoutubeContent = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
};

export const YoutubeContentSection = ({ contents, title, channelUrl, locale }: { contents: YoutubeContent[], title: string, channelUrl?: string, locale: Locale }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const containerRect = scrollEl.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDist = Infinity;

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - containerCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      setFocusedIndex(closestIndex);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-[20px] text-black font-bold">{title}</div>
        {channelUrl && (
          <a href={channelUrl} target="_blank" rel="noopener noreferrer"
            className="text-[13px] text-[#999] font-medium active:opacity-60 transition-opacity">
            {getLocaleString({ locale, key: 'more' })} &rsaquo;
          </a>
        )}
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {contents.map((content, index) => (
          <a
            key={content.videoId}
            ref={(el) => { itemRefs.current[index] = el; }}
            href={`https://www.youtube.com/watch?v=${content.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`min-w-[300px] max-w-[300px] snap-start flex-shrink-0 pl-4 ${index === contents.length - 1 ? 'pr-4' : ''}`}
          >
            <div className="w-full aspect-[16/10] relative rounded-xl overflow-hidden bg-black">
              {focusedIndex === index ? (
                <YoutubePreview
                  videoId={content.videoId}
                  duration={5}
                  className="w-full h-full"
                  watchMoreLabel={getLocaleString({ locale, key: 'watch_on_youtube' })}
                />
              ) : (
                <Image
                  src={content.thumbnailUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <p className="text-[13px] text-[#333] mt-2 line-clamp-2 leading-[1.4]">
              {content.title}
            </p>
            <span className="text-[11px] text-[#AEAEAE] mt-1 block">
              {new Date(content.publishedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
