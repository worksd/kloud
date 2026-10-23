'use client'

import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import Image from "next/image";
import { useAlphaBg } from "@/app/home/HomeAlphaBg";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { getLessonType } from "@/app/components/LessonLabel";
import { LessonType } from "@/entities/lesson/lesson";
import { LessonStatus } from "@/app/endpoint/lesson.endpoint";
import { dayDiffFromToday, formatRelativeLessonDate, LessonWhen, parseLessonWallClock } from "@/utils/lesson.relative.date";

export type JumbotronItem = {
  id: number;
  imageUrl: string;
  title?: string;
  artistName?: string;
  artistImageUrl?: string;
  /** 아래부터 2026-10-23 — 카드에 수업 정보를 더 보여준다. 전부 optional, 없으면 그 줄만 빠진다 */
  studioName?: string;
  /** 수업 소개 — 밴드 수업 응답의 description. 제목 아래 최대 2줄 */
  description?: string | null;
  /** 수업 타입 원값(PopUp/Workshop/Regular/Audition) — 라벨 키 매핑은 여기(클라이언트)서 getLessonType 으로 */
  lessonType?: LessonType;
  genre?: string | null;
  level?: string | null;
  status?: LessonStatus | string;
  isEnded?: boolean;
  /** 공개 예정 시각 / 판매 시작 시각 — 서버 필드 생기면 'N일 후 공개'·'N일 후 판매 시작' */
  openDate?: string | null;
  saleStartDate?: string | null;
  /** 수업 일시 — 수업 카드와 같은 상대 날짜 포맷 */
  when?: LessonWhen;
  duration?: number | null;
  remainingSeats?: number | null;
}

/** 레벨 한글 표기 — 카드 위에선 색 칩 대신 텍스트로만 */
const KO_LEVEL: Record<string, string> = { Beginner: '입문', Basic: '기초', Advanced: '심화' };

/** 상태 배지 — 공개/판매 예정은 날짜가 있으면 'N일 후', 없으면 상태명. 진행중(Recruiting/Ready)은 배지 없음 */
const statusBadge = (item: JumbotronItem, locale: Locale): { text: string; tone: 'light' | 'dark' } | null => {
  const t = (key: StringResourceKey) => getLocaleString({ locale, key });
  const countdown = (date: string | null | undefined, keys: [StringResourceKey, StringResourceKey, StringResourceKey], fallback: StringResourceKey) => {
    const d = date ? parseLessonWallClock({ startDate: date }) : null;
    if (!d) return t(fallback);
    const diff = dayDiffFromToday(d);
    if (diff <= 0) return t(keys[0]);
    if (diff === 1) return t(keys[1]);
    return t(keys[2]).replace('{n}', String(diff));
  };
  if (item.status === LessonStatus.Cancelled) return { text: t('jumbotron_status_cancelled'), tone: 'dark' };
  if (item.status === LessonStatus.Completed || item.isEnded) return { text: t('jumbotron_status_ended'), tone: 'dark' };
  if (item.status === LessonStatus.Pending)
    return { text: countdown(item.openDate, ['jumbotron_opens_today', 'jumbotron_opens_tomorrow', 'jumbotron_opens_in_days'], 'kiosk_lesson_status_pending'), tone: 'light' };
  if (item.status === LessonStatus.NotForSale)
    return { text: countdown(item.saleStartDate, ['jumbotron_sale_today', 'jumbotron_sale_tomorrow', 'jumbotron_sale_in_days'], 'kiosk_lesson_status_not_for_sale'), tone: 'light' };
  if (item.status === LessonStatus.PreSale) return { text: t('jumbotron_status_presale'), tone: 'light' };
  if (item.status === LessonStatus.SaleClosed) return { text: t('jumbotron_status_sale_closed'), tone: 'dark' };
  return null;
};

/** 실시간 카운트다운 대상 — 공개 예정(openDate)·판매 예정(saleStartDate) 이고 시각이 미래일 때만 */
const countdownTarget = (item: JumbotronItem): { at: Date; labelKey: StringResourceKey } | null => {
  const pick = item.status === LessonStatus.Pending ? { date: item.openDate, labelKey: 'jumbotron_countdown_open' as const }
    : item.status === LessonStatus.NotForSale ? { date: item.saleStartDate, labelKey: 'jumbotron_countdown_sale' as const }
    : null;
  if (!pick?.date) return null;
  const at = parseLessonWallClock({ startDate: pick.date });
  if (!at || at.getTime() <= Date.now()) return null;
  return { at, labelKey: pick.labelKey };
};

/** '2일 14:32:07' / 하루 안 남으면 '14:32:07' — 1초마다 갱신, 0 되면 멈춤 */
const Countdown = ({ at, labelKey, locale }: { at: Date; labelKey: StringResourceKey; locale: Locale }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = Math.max(0, Math.floor((at.getTime() - now) / 1000));
  const d = Math.floor(left / 86400);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hms = `${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  return (
    <div className="inline-flex items-center gap-2 self-start mb-2.5 rounded-full bg-black/45 backdrop-blur-md pl-1 pr-3 py-1 ring-1 ring-white/10">
      <span className="px-2 py-[3px] rounded-full bg-[#C8FF4D] text-black text-[11px] font-bold leading-none">
        {getLocaleString({ locale, key: labelKey })}
      </span>
      <span className="text-white text-[15px] font-bold tabular-nums tracking-tight leading-none">
        {d > 0 && <>{d}<span className="text-white/60 text-[12px] font-semibold ml-0.5 mr-1.5">{getLocaleString({ locale, key: 'jumbotron_countdown_day' })}</span></>}
        {hms}
      </span>
    </div>
  );
};

const GAP = 12;

export const Jumbotron = ({ items, locale = 'ko' }: { items: JumbotronItem[]; locale?: Locale }) => {
  // 상대 날짜('N일 후', '내일 오후 7:00')는 기기 시각 기준이라 서버 렌더와 어긋날 수 있다 — 마운트 후에만 그린다
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
            className="relative flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-[#F1F3F6] cursor-pointer active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            style={{ width: 'calc(100vw - 40px)', aspectRatio: '350/457', scrollSnapStop: 'always' }}
            onClick={() => kloudNav.push(KloudScreen.LessonDetail(item.id))}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt=""
                width={350}
                height={457}
                // 종료·취소 수업은 흑백으로 눌러 판매 중 카드와 구분
                className={`w-full h-full object-cover ${
                  item.status === LessonStatus.Completed || item.status === LessonStatus.Cancelled || item.isEnded ? 'grayscale opacity-70' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full bg-[#F1F3F6]" />
            )}

            {/* 하단 정보 — 상태(공개·판매 예정 카운트다운 등)는 좌상단 배지 대신 제목 위 첫 줄에 타입·장르와 함께.
                값 없는 항목은 그냥 빠진다 */}
            {(item.title || item.artistName) && (() => {
              const status = mounted ? statusBadge(item, locale) : null;
              const seats = !status && item.remainingSeats != null && item.remainingSeats > 0 && item.remainingSeats <= 5
                ? getLocaleString({ locale, key: 'jumbotron_seats_left' }).replace('{n}', String(item.remainingSeats))
                : null;
              const typeKey = item.lessonType ? getLessonType({ type: item.lessonType }) : undefined;
              const tags = [
                typeKey ? getLocaleString({ locale, key: typeKey }) : null,
                item.genre || null,
                item.level ? (locale === 'ko' ? (KO_LEVEL[item.level] ?? item.level) : item.level) : null,
              ].filter(Boolean) as string[];
              const when = mounted && item.when ? formatRelativeLessonDate(item.when, locale) : '';
              // 실시간 카운트다운이 있으면 그게 상태를 대신한다(작은 배지 중복 표시 안 함)
              const cd = mounted ? countdownTarget(item) : null;
              const highlight = cd ? null : (status?.text ?? seats);
              return (
                <>
                  {/* 하단 dim — 여러 단계로 부드럽게 어두워지게(2단 그라디언트는 경계가 띠처럼 보였다) */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-[72%] pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0) 100%)' }}
                  />
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-5 flex flex-col">
                    {cd && <Countdown at={cd.at} labelKey={cd.labelKey} locale={locale} />}
                    {(highlight || tags.length > 0) && (
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                        {highlight && (
                          <span className={`shrink-0 px-2 py-[3px] rounded-[6px] text-[11px] font-bold leading-none ${
                            status?.tone === 'dark' ? 'bg-white/20 text-white' : 'bg-[#C8FF4D] text-black'
                          }`}>
                            {highlight}
                          </span>
                        )}
                        {tags.length > 0 && (
                          <span className="text-white/75 text-[12px] font-semibold tracking-wide truncate">{tags.join('  ·  ')}</span>
                        )}
                      </div>
                    )}
                    {item.title && (
                      <span className="text-white text-[21px] font-bold leading-[1.3] tracking-[-0.02em] line-clamp-2">{item.title}</span>
                    )}
                    {item.description?.trim() && (
                      <p className="mt-1.5 text-white/70 text-[13px] leading-[1.5] line-clamp-2 whitespace-pre-line">{item.description.trim()}</p>
                    )}
                    {(item.artistName || when) && (
                      <div className="mt-3.5 pt-3.5 border-t border-white/15 flex items-center justify-between gap-3 min-w-0">
                        {item.artistName ? (
                          <div className="flex items-center gap-2 min-w-0">
                            {item.artistImageUrl && (
                              <Image src={item.artistImageUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-white/30" />
                            )}
                            <span className="text-white text-[13px] font-semibold truncate">{item.artistName}</span>
                          </div>
                        ) : <span />}
                        {when && <span className="shrink-0 text-white/70 text-[12px] font-medium">{when}</span>}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
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
