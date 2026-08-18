'use client';

// PC 점보트론 — 세로형(3:4) 카드 캐러셀.
// 서비스 포스터가 대부분 인물 세로 사진이라 가로 히어로 대신 멀티 카드 캐러셀로 보여준다.
// 마우스 드래그 + CSS 스냅 + 호버 시 좌우 화살표. 드래그로 움직였으면 카드 클릭(상세 이동)은 무시.

import React, { useRef, useState } from "react";
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

const CARD_W = 300;   // 카드 폭(px)
const GAP = 16;       // gap-4

export const LessonsPcHeroCarousel = ({items}: {items: HeroItem[]}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0, moved: false });
  const [hovered, setHovered] = useState(false);

  const scrollByCards = (dir: 1 | -1) => {
    containerRef.current?.scrollBy({ left: dir * (CARD_W + GAP) * 2, behavior: 'smooth' });
  };

  // 마우스 드래그 스크롤 — 드래그 중엔 snap을 꺼서 손에 붙어 다니게, 놓으면 CSS 스냅 복원
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
      setTimeout(() => { el.style.scrollSnapType = ''; }, 50);
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

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        // py+음수 마진 — 호버로 카드가 떠오르고 섀도가 퍼질 때 overflow 컨테이너에 잘리지 않게 상하 여유
        className="flex overflow-x-auto snap-x scrollbar-hide gap-4 cursor-grab select-none py-6 -my-6 px-3 -mx-3"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={KloudScreen.LessonDetail(item.id)}
            className="snap-start flex-none group"
            style={{ width: CARD_W }}
          >
            <div className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden bg-[#F1F3F6] transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"/>
              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-1.5">
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
                <h2 className="text-[20px] font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
                  {item.title}
                </h2>
                <p className="text-[13px] text-white/80 font-medium truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 좌우 화살표 — 호버 시에만 (유튜브/넷플릭스식) */}
      {items.length > 3 && (
        <>
          <button
            aria-label="이전"
            onClick={() => scrollByCards(-1)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity duration-200 hover:scale-105 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M15 6l-6 6 6 6" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            aria-label="다음"
            onClick={() => scrollByCards(1)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity duration-200 hover:scale-105 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M9 6l6 6-6 6" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
