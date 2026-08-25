'use client';

// PC 홈 수업 그리드 — GET /lessons/valid.
// 워크샵(workshops)은 최상단 다크 스포트라이트 밴드(큰 카드 가로 스크롤)로 강조하고,
// 일반 수업(lessons)은 그 아래 5열 세로 썸네일(3:4) 격자.
// 페이지네이션은 리스트별 독립(리스트당 18개) — 격자는 세로 스크롤 하단, 워크샵은 가로 스크롤 끝에서 다음 페이지 로드.

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
import { optimizedImageSrc } from '@/utils/optimized.image';

const artistOf = (l: ValidLessonResponse) => l.artists?.[0]?.nickName ?? l.artists?.[0]?.name;


// 검색 결과(/search) 등 다른 PC 격자에서도 재사용
// memo: 무한 스크롤로 페이지가 붙을 때 기존 카드 수백 개가 통째로 리렌더되는 것을 막는다 (l/locale 불변).
export const LessonCard = React.memo(function LessonCard({l, locale}: { l: ValidLessonResponse; locale: Locale }) {
  const soldOut = l.status === 'Ready';
  return (
    // content-visibility: 화면 밖 카드는 렌더/페인트를 통째로 스킵 (긴 그리드 스크롤 성능의 핵심).
    // contain-intrinsic-size로 스킵 중에도 대략적 높이를 유지해 스크롤바 튐 방지.
    <Link
      href={KloudScreen.LessonDetail(l.id)}
      className="flex flex-col gap-3 group [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F1F3F6] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.35)]">
        {l.thumbnailUrl && (
          // 원본 대신 optimizer 리사이즈(카드 폭×DPR2 ≈ 640) + lazy — 원본 수 MB 디코드가 스크롤을 막던 주범
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageSrc(l.thumbnailUrl, 640)}
            alt={l.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
        )}
        {/* 왼쪽 위 — 스튜디오 로고 (장르 대신) */}
        {l.studio.profileImageUrl && (
          <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/80 shadow-sm bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={optimizedImageSrc(l.studio.profileImageUrl, 96)} alt={l.studio.name} loading="lazy" decoding="async" className="w-full h-full object-cover"/>
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
});

// 다크 밴드 위에 올라가는 워크샵 카드 — LessonCard와 같은 구성이되 폭 고정 + 밝은 텍스트.
// memo: 페이지 append 시 기존 카드 리렌더 방지 (LessonCard와 동일).
const WorkshopCard = React.memo(function WorkshopCard({l, locale}: { l: ValidLessonResponse; locale: Locale }) {
  const soldOut = l.status === 'Ready';
  return (
    <Link
      href={KloudScreen.LessonDetail(l.id)}
      className="flex flex-col gap-3 group w-[232px] shrink-0 snap-start [content-visibility:auto] [contain-intrinsic-size:232px_400px]"
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#1F1F1F] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]">
        {l.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageSrc(l.thumbnailUrl, 640)}
            alt={l.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
        )}
        {l.studio.profileImageUrl && (
          <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/80 shadow-sm bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={optimizedImageSrc(l.studio.profileImageUrl, 96)} alt={l.studio.name} loading="lazy" decoding="async" className="w-full h-full object-cover"/>
          </div>
        )}
        {soldOut && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90">
            <span className="text-[11px] font-bold text-[#E5484D]">{l.statusLabel}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-bold text-white truncate">{l.title}</span>
        <span className="text-[12px] text-[#A0A5AB] truncate">
          {l.studio.name}{artistOf(l) ? ` · ${artistOf(l)}` : ''}
        </span>
        <LessonRelativeDate
          when={{ startDate: l.startDate }}
          locale={locale}
          fallback={l.date}
          className="text-[12px] text-[#6B7280] truncate"
        />
        {/* 스튜디오 주소 — 살짝만 (가장 어두운 톤 + 핀 아이콘). 없으면 미노출 */}
        {l.studio.address && (
          <span className="flex items-center gap-1 text-[11px] text-[#5C5F63] min-w-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                d="M12 21s-7-5.1-7-11a7 7 0 1114 0c0 5.9-7 11-7 11z"
                stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="truncate">{l.studio.address}</span>
          </span>
        )}
      </div>
    </Link>
  );
});

// 워크샵 스포트라이트 — 최상단 다크 밴드 + 큰 카드 가로 스크롤.
// 가로 스크롤 끝(sentinel, root=스크롤 컨테이너)에 닿으면 다음 페이지 로드.
const WorkshopSpotlight = ({initial, totalPage, locale}: {
  initial: ValidLessonResponse[];
  totalPage: number;
  locale: Locale;
}) => {
  const [workshops, setWorkshops] = useState<ValidLessonResponse[]>(initial);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < totalPage;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getValidLessonsAction({ page: nextPage });
    if ('lessons' in res) {
      const list = res.workshops ?? [];
      setWorkshops((prev) => {
        const seen = new Set(prev.map((l) => l.id));
        return [...prev, ...list.filter((l) => !seen.has(l.id))];
      });
      setPage(nextPage);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    if (!endRef.current || !scrollRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
      },
      { root: scrollRef.current, threshold: 0.1 },
    );
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  if (workshops.length === 0) return null;

  return (
    <section className="mb-10 rounded-3xl bg-[#0F0F0F] px-7 pt-6 pb-7 overflow-hidden">
      <header className="flex items-baseline gap-2.5 mb-5">
        <h2 className="text-[20px] font-bold text-white tracking-tight">
          {getLocaleString({locale, key: 'lessons_home_workshop_title'})}
        </h2>
        {/* 밴드 SOON/NEW 태그와 같은 계열의 포인트 — 강조 섹션임을 알리는 액센트 */}
        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E5484D] text-white text-[10px] font-bold font-paperlogy leading-none">
          HOT
        </span>
      </header>

      {/* 세로 격자보다 큰 카드(232px)를 가로로 — 상단 히어로 톤 */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {workshops.map((l) => <WorkshopCard key={l.id} l={l} locale={locale}/>)}
        <div ref={endRef} className="w-10 shrink-0 flex items-center justify-center">
          {isLoading && (
            <div className="w-5 h-5 border-2 border-[#3A3A3A] border-t-white rounded-full animate-spin"/>
          )}
        </div>
      </div>
    </section>
  );
};

export const ValidLessonsGrid = ({initialLessons, initialWorkshops = [], lessonsTotalPage, workshopsTotalPage = 0, locale = 'ko'}: {
  initialLessons: ValidLessonResponse[];
  initialWorkshops?: ValidLessonResponse[];
  lessonsTotalPage: number;
  workshopsTotalPage?: number;
  locale?: Locale;
}) => {
  const [lessons, setLessons] = useState<ValidLessonResponse[]>(initialLessons);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasMore = page < lessonsTotalPage;

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

  const hasWorkshops = initialWorkshops.length > 0 || workshopsTotalPage > 0;

  // 스크롤 중 hover 무력화 — 스크롤하며 커서가 카드들을 스치면 hover 전환(그림자/스케일)이
  // 연쇄로 페인트를 유발해 프레임을 깎는다. 스크롤 동안만 pointer-events를 꺼서 차단하고
  // 멈추면 150ms 뒤 복원 (OTT 그리드들이 쓰는 표준 기법). state 대신 classList로 리렌더 없이 토글.
  const hoverGuardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      hoverGuardRef.current?.classList.add('pointer-events-none');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => hoverGuardRef.current?.classList.remove('pointer-events-none'), 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={hoverGuardRef}>
      {/* 워크샵은 최상단에서 강조 — 없으면 밴드 자체가 안 그려진다 */}
      {hasWorkshops && (
        <WorkshopSpotlight initial={initialWorkshops} totalPage={workshopsTotalPage} locale={locale}/>
      )}

      {/* 페이지 헤더는 워크샵 아래, 수업 격자 위 — 기능 설명 대신 사용자를 부르는 한 줄 (큰 플랫폼 톤) */}
      <header className="mb-7">
        <h1 className="text-[24px] font-bold text-black tracking-tight">
          {getLocaleString({locale, key: 'lessons_home_title'})}
        </h1>
        <p className="text-[14px] text-[#86898C] mt-1.5">
          {getLocaleString({locale, key: 'lessons_home_subtitle'})}
        </p>
      </header>

      {lessons.length === 0 ? (
        <p className="py-40 text-center text-[14px] text-[#A0A5AB]">{getLocaleString({locale, key: 'no_open_lessons'})}</p>
      ) : (
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
      )}
    </div>
  );
};
