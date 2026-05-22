'use client'

import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import Image from "next/image";
import { useAlphaBg } from "@/app/home/HomeAlphaBg";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

type JumbotronItem = {
  id: number;
  imageUrl: string;
  title?: string;
  artistName?: string;
  artistImageUrl?: string;
}

const GAP = 12;

export const Jumbotron = ({ items }: { items: JumbotronItem[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const { setBgImage } = useAlphaBg();

  const N = items.length;
  // 2개 이상이면 3배 복제로 무한 스크롤 시뮬레이션 — 중간 그룹에서 시작.
  // 양쪽 끝(첫 그룹 / 세번째 그룹) 도달 시 silent jump으로 중간 그룹의 같은 카드로 복귀.
  const isInfinite = N >= 2;
  const displayItems = isInfinite ? [...items, ...items, ...items] : items;

  // 초기 scrollLeft를 중간 그룹의 첫 카드로 — paint 전에 적용해서 깜빡임 없게.
  useLayoutEffect(() => {
    if (!isInfinite) return;
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    if (!card) return;
    const cardW = card.clientWidth + GAP;
    el.scrollLeft = N * cardW;
  }, [isInfinite, N]);

  // 스크롤 핸들러 — current(dot용 0~N-1) 갱신 + 경계 도달 시 silent jump
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let jumpTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      const card = el.querySelector('[data-card]') as HTMLElement | null;
      if (!card) return;
      const cardW = card.clientWidth + GAP;
      const idx = Math.round(el.scrollLeft / cardW);
      setCurrent(((idx % Math.max(N, 1)) + N) % Math.max(N, 1));

      if (!isInfinite) return;
      // 스크롤 멈춘 뒤(짧은 debounce) 경계면 점프
      if (jumpTimer) clearTimeout(jumpTimer);
      jumpTimer = setTimeout(() => {
        const curIdx = Math.round(el.scrollLeft / cardW);
        const oneGroup = N * cardW;
        if (curIdx < N) {
          el.scrollLeft = el.scrollLeft + oneGroup;
        } else if (curIdx >= 2 * N) {
          el.scrollLeft = el.scrollLeft - oneGroup;
        }
      }, 120);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (jumpTimer) clearTimeout(jumpTimer);
    };
  }, [N, isInfinite]);

  useEffect(() => {
    const newImage = items[current]?.imageUrl;
    if (newImage) setBgImage(newImage);
  }, [current, items, setBgImage]);

  // 자동 슬라이드: 5초마다 다음 카드. 사용자 터치/포인터 다운 시 타이머 리셋.
  // 무한 모드에선 modulo 없이 오른쪽으로 계속 진행 → 경계 도달 시 위의 silent jump가 받아줌.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (N <= 1) return;
    timerRef.current = setTimeout(() => {
      const el = scrollRef.current;
      const card = el?.querySelector('[data-card]') as HTMLElement | null;
      if (el && card) {
        const cardW = card.clientWidth + GAP;
        if (isInfinite) {
          el.scrollTo({ left: el.scrollLeft + cardW, behavior: 'smooth' });
        } else {
          const cur = Math.round(el.scrollLeft / cardW);
          const next = (cur + 1) % N;
          el.scrollTo({ left: next * cardW, behavior: 'smooth' });
        }
      }
      scheduleNext();
    }, 5000);
  }, [N, isInfinite]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNext]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || N <= 1) return;
    const reset = () => scheduleNext();
    el.addEventListener('touchstart', reset, { passive: true });
    el.addEventListener('pointerdown', reset, { passive: true });
    return () => {
      el.removeEventListener('touchstart', reset);
      el.removeEventListener('pointerdown', reset);
    };
  }, [scheduleNext, N]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col py-1">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory overscroll-x-contain"
        style={{ scrollPaddingLeft: '20px', scrollPaddingRight: '20px', gap: `${GAP}px`, paddingLeft: '20px', paddingRight: '20px' }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            data-card
            className="relative flex-shrink-0 snap-start rounded-xl overflow-hidden bg-[#F1F3F6] cursor-pointer active:scale-[0.98] transition-transform"
            style={{ width: 'calc(100vw - 40px)', aspectRatio: '350/457', scrollSnapStop: 'always' }}
            onClick={() => kloudNav.push(KloudScreen.LessonDetail(item.id))}
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

            {/* 하단 dim gradient + 수업/강사 정보 */}
            {(item.title || item.artistName) && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 flex flex-col gap-1.5">
                  {item.title && (
                    <span className="text-white text-[16px] font-bold leading-snug line-clamp-2">{item.title}</span>
                  )}
                  {item.artistName && (
                    <div className="flex items-center gap-2">
                      {item.artistImageUrl && (
                        <Image
                          src={item.artistImageUrl}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-white/70 text-[13px] font-medium">{item.artistName}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 페이지 인디케이터 — 항상 원본 N개만큼만 */}
      {N > 1 && (
        <div className="flex justify-center mt-3 gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-[6px] rounded-full transition-all duration-200 ${
                i === current ? 'w-[18px] bg-black' : 'w-[6px] bg-black/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
