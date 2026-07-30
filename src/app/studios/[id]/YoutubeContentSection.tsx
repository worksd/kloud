'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { YoutubePreview } from "@/app/components/YoutubePreview";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { formatRelativePast } from "@/utils/relative.time";
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

              {/*
                상대 시각을 썸네일 좌하단 배지로 — 카드 아래에 별도 한 줄로 두면
                (썸네일 + 제목 2줄 + 시간 1줄) 카드가 세로로 늘어져 군더더기처럼 보인다.
                우하단은 유튜브 로고/재생시간이 들어오는 자리라 왼쪽으로 피했다.
                pointer-events-none으로 카드 탭을 막지 않는다.
              */}
              <span
                className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 rounded-[6px]
                  bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/95 backdrop-blur-sm"
                title={new Date(content.publishedAt).toLocaleString(locale === 'ko' ? 'ko-KR' : undefined)}
                suppressHydrationWarning
              >
                {formatRelativePast(content.publishedAt, locale)}
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#333] mt-2 line-clamp-2 leading-[1.4]">
              {content.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
