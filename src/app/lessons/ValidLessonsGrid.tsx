'use client';

// PC 홈 수업 그리드 — GET /lessons/valid 를 5열 세로 썸네일(3:4) 격자로.
// 밴드/히어로 구분 없이 전부 같은 카드. 스크롤 하단 도달 시 다음 페이지 로드 (페이지당 20개).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { KloudScreen } from '@/shared/kloud.screen';
import { ValidLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { getValidLessonsAction } from '@/app/lessons/get.valid.lessons.action';
import { LessonRelativeDate } from '@/app/components/LessonRelativeDate';
import { LessonTypeLabel } from '@/app/components/LessonLabel';
import { LessonType } from '@/entities/lesson/lesson';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';

const artistOf = (l: ValidLessonResponse) => l.artists?.[0]?.nickName ?? l.artists?.[0]?.name;


// 검색 결과(/search) 등 다른 PC 격자에서도 재사용
export const LessonCard = ({l, locale}: { l: ValidLessonResponse; locale: Locale }) => {
  const soldOut = l.status === 'Ready';
  return (
    <Link href={KloudScreen.LessonDetail(l.id)} className="flex flex-col gap-3 group">
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F1F3F6] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.35)]">
        {l.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={l.thumbnailUrl}
            alt={l.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
        )}
        {/* 왼쪽 위 — 스튜디오 로고 (장르 대신) */}
        {l.studio.profileImageUrl && (
          <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/80 shadow-sm bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.studio.profileImageUrl} alt={l.studio.name} className="w-full h-full object-cover"/>
          </div>
        )}
        {/* 오른쪽 위 — 정원 마감(위) + 수업 타입(정규/워크샵/팝업/오디션) 라벨 */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {soldOut && (
            <div className="px-2 py-0.5 rounded-md bg-white/90">
              <span className="text-[11px] font-bold text-[#E5484D]">{l.statusLabel}</span>
            </div>
          )}
          {l.type && <LessonTypeLabel type={l.type as LessonType} locale={locale}/>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-bold text-black truncate">{l.title}</span>
        <span className="text-[12px] text-[#86898C] truncate">
          {l.studio.name}{artistOf(l) ? ` · ${artistOf(l)}` : ''}
        </span>
        {/* 상대 시각 — 모바일과 동일한 표기(오늘 저녁 7:00 / 내일 오전 10:00 / 이번주 금요일 …) */}
        <LessonRelativeDate
          when={{ startDate: l.startDate }}
          locale={locale}
          fallback={l.date}
          className="text-[12px] text-[#B0B8BF] truncate"
        />
      </div>
    </Link>
  );
};

export const ValidLessonsGrid = ({initialLessons, totalPage, locale = 'ko'}: {
  initialLessons: ValidLessonResponse[];
  totalPage: number;
  locale?: Locale;
}) => {
  const [lessons, setLessons] = useState<ValidLessonResponse[]>(initialLessons);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < totalPage;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getValidLessonsAction({ page: nextPage });
    if ('lessons' in res) {
      setLessons((prev) => {
        const seen = new Set(prev.map((l) => l.id));
        return [...prev, ...res.lessons.filter((l) => !seen.has(l.id))];
      });
      setPage(nextPage);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, isLoading]);

  if (lessons.length === 0) {
    return (
      <p className="py-40 text-center text-[14px] text-[#A0A5AB]">지금 예약 가능한 수업이 없어요</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-6 gap-x-4 gap-y-10">
        {lessons.map((l) => <LessonCard key={l.id} l={l} locale={locale}/>)}
      </div>

      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
        )}
      </div>
    </>
  );
};
