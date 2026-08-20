'use client';

// 강사가 진행한 수업 목록 (모바일 전용) — GET /artists/:id/lessons, 최근 시작순.
// 여러 스튜디오의 수업이 섞이므로 행에 스튜디오 이름을 함께 표시한다.
// 스크롤 하단 도달 시 다음 페이지 로드 (20개/page). 행 탭 → 수업 상세.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { ValidLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { getArtistLessonsAction } from '@/app/artistLessons/actions';
import LeftArrow from '../../../public/assets/left-arrow.svg';

export const ArtistLessonsList = ({artistId, initialLessons, totalPage, locale}: {
  artistId: number;
  initialLessons: ValidLessonResponse[];
  totalPage: number;
  locale: Locale;
}) => {
  const [lessons, setLessons] = useState<ValidLessonResponse[]>(initialLessons);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < totalPage;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getArtistLessonsAction({ artistId, page: nextPage });
    setLessons((prev) => {
      const seen = new Set(prev.map((l) => l.id));
      return [...prev, ...res.lessons.filter((l) => !seen.has(l.id))];
    });
    setPage(nextPage);
    setIsLoading(false);
  }, [artistId, page, isLoading, hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => kloudNav.back()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full active:bg-[#F2F4F6] transition-colors"
        >
          <LeftArrow className="h-5 w-5 text-black"/>
        </button>
        <h1 className="text-[18px] font-bold text-black">
          {getLocaleString({ locale, key: 'artist_my_lessons' })}
        </h1>
      </div>

      {lessons.length === 0 ? (
        <p className="py-32 text-center text-[14px] text-[#A0A5AB]">
          {getLocaleString({ locale, key: 'artist_my_lessons_empty' })}
        </p>
      ) : (
        <>
          <ul className="px-5 pt-2 flex flex-col divide-y divide-[#F1F3F6]">
            {lessons.map((l) => {
              const ended = l.status === 'Completed';
              return (
                <li
                  key={l.id}
                  onClick={() => kloudNav.push(KloudScreen.LessonDetail(l.id))}
                  className="flex items-center gap-3 py-3 cursor-pointer active:bg-[#F7F8F9] -mx-2 px-2 rounded-[10px] transition-colors"
                >
                  {l.thumbnailUrl ? (
                    <Image
                      src={l.thumbnailUrl}
                      alt={l.title}
                      width={48}
                      height={48}
                      className={`w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[#F1F3F6] ${ended ? 'opacity-50' : ''}`}
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-lg bg-[#F1F3F6] flex-shrink-0"/>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-[14px] font-semibold truncate ${ended ? 'text-[#919191]' : 'text-black'}`}>
                      {l.title}
                    </span>
                    {/* 여러 스튜디오가 섞이므로 어느 학원 수업인지 표시 */}
                    <span className="text-[12px] text-[#919191] truncate">
                      {l.studio.name}{l.date ? ` · ${l.date}` : ''}
                    </span>
                  </div>
                  {l.statusLabel && (
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ended ? 'bg-[#F3F4F6] text-[#9CA3AF]' : 'bg-[#E8F5E9] text-[#2E7D32]'
                    }`}>
                      {l.statusLabel}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <div ref={loadMoreRef} className="flex items-center justify-center py-6">
            {isLoading && (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
            )}
          </div>
        </>
      )}
    </div>
  );
};
