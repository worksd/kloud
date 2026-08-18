'use client';

// PC 전용 수업 페이지 hero 캐러셀 — 5개 큰 카드, 자동 슬라이드 + dots.
// 추후 BE에서 featured 리스트 받아오면 props로 교체.

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";

export type HeroItem = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
  /** D-day 칩 (예: 'D-3', 'D-Day') — 있으면 배지 옆에 흰색 칩으로 강조 */
  dday?: string;
};

const AUTO_INTERVAL_MS = 5000;

export const LessonsPcHeroCarousel = ({items}: {items: HeroItem[]}) => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const N = items.length;

  const goTo = useCallback((idx: number) => {
    const safe = ((idx % N) + N) % N;
    setCurrent(safe);
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-hero-card]') as HTMLElement | null;
    if (!card) return;
    el.scrollTo({ left: safe * (card.clientWidth + 16), behavior: 'smooth' });
  }, [N]);

  // 자동 슬라이드
  useEffect(() => {
    if (N <= 1) return;
    const timer = setInterval(() => goTo(current + 1), AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [current, N, goTo]);

  // 스크롤로 인한 current 갱신
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const card = el.querySelector('[data-hero-card]') as HTMLElement | null;
      if (!card) return;
      const cardW = card.clientWidth + 16;
      const idx = Math.round(el.scrollLeft / cardW);
      setCurrent(((idx % N) + N) % N);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [N]);

  // 마우스 드래그 스크롤 — 드래그 중엔 snap을 꺼서 손에 붙어 다니게 하고,
  // 놓으면 가장 가까운 카드로 스냅. 일정 거리 이상 움직였으면 클릭(링크 이동)은 무시.
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0, moved: false });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    dragRef.current = { dragging: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.style.scrollSnapType = 'none';
    el.style.cursor = 'grabbing';

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      if (Math.abs(dx) > 5) dragRef.current.moved = true;
      el.scrollLeft = dragRef.current.startScroll - dx;
      ev.preventDefault();
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      el.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // 스냅 판정 — 80px 이상 끌었으면 방향대로 한 장, 아니면 가장 가까운 카드로
      const card = el.querySelector('[data-hero-card]') as HTMLElement | null;
      if (card) {
        const cardW = card.clientWidth + 16;
        const startIdx = Math.round(dragRef.current.startScroll / cardW);
        const delta = el.scrollLeft - dragRef.current.startScroll;
        if (delta > 80) goTo(startIdx + 1);
        else if (delta < -80) goTo(startIdx - 1);
        else goTo(Math.round(el.scrollLeft / cardW));
      }
      setTimeout(() => { el.style.scrollSnapType = ''; }, 400);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // 드래그였다면 카드 클릭(링크 이동) 취소
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  if (N === 0) return null;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 cursor-grab select-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={KloudScreen.LessonDetail(item.id)}
            data-hero-card
            className="snap-center flex-none w-full"
          >
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-[#F1F3F6] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.dday && (
                    <span className="text-[11px] font-extrabold text-black bg-white px-2.5 py-1 rounded-full font-paperlogy">
                      {item.dday}
                    </span>
                  )}
                </div>
                <h2 className="text-[32px] font-bold text-white leading-tight tracking-tight drop-shadow-md">
                  {item.title}
                </h2>
                <p className="text-[15px] text-white/90 font-medium">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* dots */}
      {N > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className={[
                'h-1.5 rounded-full transition-all',
                i === current ? 'w-8 bg-black' : 'w-1.5 bg-[#dcdee0] hover:bg-[#bcbfc2]',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
};
