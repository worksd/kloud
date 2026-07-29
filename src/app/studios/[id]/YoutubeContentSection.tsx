'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { YoutubePreview } from "@/app/components/YoutubePreview";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import YoutubeIcon from "@/../public/assets/youtube-colored.svg";

type YoutubeContent = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
};

export const YoutubeContentSection = ({ contents, title, channelUrl, locale }: { contents: YoutubeContent[], title: string, channelUrl?: string, locale: Locale }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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
            className="flex items-center gap-1.5 text-[13px] text-[#999] font-medium active:opacity-60 transition-opacity">
            {/* 아이콘 원본이 20×16 — h-5로 두면 상하 여백이 생겨 텍스트와 어긋난다. 원본 비율 유지 */}
            <YoutubeIcon className="w-5 h-4 shrink-0 block" />
            {/* leading-none + 별도 span: 라인하이트 때문에 아이콘과 중심이 안 맞는 것 방지 */}
            <span className="leading-none">{getLocaleString({ locale, key: 'more' })}</span>
            {/* › 문자는 베이스라인에 걸려 어긋나므로 아이콘으로 교체 */}
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 shrink-0 block">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {contents.map((content, index) => (
          <div
            key={content.videoId}
            ref={(el) => { itemRefs.current[index] = el; }}
            onClick={() => window.open(`https://www.youtube.com/watch?v=${content.videoId}`, '_blank')}
            className={`min-w-[300px] max-w-[300px] snap-start flex-shrink-0 pl-4 cursor-pointer ${index === contents.length - 1 ? 'pr-4' : ''}`}
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
            <span className="text-[11px] text-[#AEAEAE] mt-1 block" suppressHydrationWarning>
              {new Date(content.publishedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
