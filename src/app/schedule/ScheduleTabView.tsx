'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

type CalendarLesson = {
  id: number;
  title: string;
  thumbnailUrl: string;
  startTime: string;
  endTime: string;
  room?: string;
  date: string; // yyyy-MM-dd
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const getDaysAround = (baseDate: Date, range: number = 60): Date[] => {
  const days: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }
  return days;
};

const getWeekLabel = (date: Date): string => {
  const month = date.getMonth() + 1;
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const weekNum = Math.ceil((date.getDate() + ((firstDay.getDay() + 6) % 7)) / 7);
  const weekNames = ['첫째주', '둘째주', '셋째주', '넷째주', '다섯째주', '여섯째주'];
  return `${month}월 ${weekNames[weekNum - 1] ?? `${weekNum}째주`}`;
};

const formatDateHeader = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const ScheduleTabView = ({ lessons, studioName, studioImageUrl }: {
  lessons: CalendarLesson[],
  studioName?: string,
  studioImageUrl?: string,
}) => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const dayStripRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const dateHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [bottomPadding, setBottomPadding] = useState(0);

  const allDays = useMemo(() => getDaysAround(today, 60), [today]);

  // 선택된 날짜가 속한 주의 월~일
  const visibleDates = useMemo(() => {
    const day = selectedDate.getDay();
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const lessonsByDate = useMemo(() => {
    const map: Record<string, CalendarLesson[]> = {};
    for (const l of lessons) {
      if (!map[l.date]) map[l.date] = [];
      map[l.date].push(l);
    }
    return map;
  }, [lessons]);

  // 요일 스트립에서 선택된 날짜를 센터로 스크롤
  const scrollDayStripToDate = useCallback((date: Date) => {
    if (!dayStripRef.current) return;
    const idx = allDays.findIndex(d => isSameDay(d, date));
    const el = dayStripRef.current.children[idx] as HTMLElement;
    if (el) {
      const containerWidth = dayStripRef.current.clientWidth;
      const scrollLeft = el.offsetLeft - containerWidth / 2 + el.clientWidth / 2;
      dayStripRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [allDays]);

  // 날짜 클릭
  const handleDateClick = useCallback((date: Date) => {
    isUserScrolling.current = true;
    setSelectedDate(date);
    scrollDayStripToDate(date);

    // 해당 날짜 섹션으로 스크롤
    const key = toDateStr(date);
    const el = dateHeaderRefs.current[key];
    if (el) {
      const stickyOffset = stickyRef.current?.getBoundingClientRect().height ?? 160;
      const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    // 스크롤 완료 후 자동 추적 재개
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 800);
  }, [scrollDayStripToDate]);

  // 세로 스크롤 시 현재 보이는 날짜 감지 → 요일 스트립 업데이트
  useEffect(() => {
    const handleScroll = () => {
      if (isUserScrolling.current) return;

      const stickyOffset = stickyRef.current?.getBoundingClientRect().height ?? 170;
      let closestDate: string | null = null;
      let closestDist = Infinity;

      for (const [key, el] of Object.entries(dateHeaderRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - stickyOffset);
        if (rect.top <= stickyOffset + 50 && dist < closestDist) {
          closestDist = dist;
          closestDate = key;
        }
      }

      if (closestDate) {
        const [y, m, d] = closestDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        if (!isSameDay(date, selectedDate)) {
          setSelectedDate(date);
          scrollDayStripToDate(date);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedDate, scrollDayStripToDate]);

  // 초기 로드 시 오늘로 스크롤
  useEffect(() => {
    scrollDayStripToDate(today);
  }, []);

  // 마지막 날짜가 sticky 헤더 바로 아래까지 올라갈 수 있도록 하단 패딩 계산
  useEffect(() => {
    const calculate = () => {
      const lastKey = toDateStr(visibleDates[visibleDates.length - 1]);
      const lastEl = dateHeaderRefs.current[lastKey];
      if (!lastEl || !listRef.current) return;

      const stickyHeight = stickyRef.current?.getBoundingClientRect().height ?? 120;
      const viewportHeight = window.innerHeight;
      // 마지막 섹션의 높이 (해당 날짜 헤더 + 수업 카드들)
      const lastSectionHeight = lastEl.getBoundingClientRect().height;
      // 필요한 패딩 = 뷰포트 - sticky높이 - 마지막섹션높이
      const needed = Math.max(0, viewportHeight - stickyHeight - lastSectionHeight);
      setBottomPadding(needed);
    };

    // DOM 렌더 후 계산
    requestAnimationFrame(calculate);
  }, [visibleDates]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* 헤더 + 주간 선택기 (sticky) */}
      <div ref={stickyRef} className="sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-2.5 px-6 pt-4 pb-2">
          {studioImageUrl && (
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <Image src={studioImageUrl} alt="" width={28} height={28} className="object-cover w-full h-full" />
            </div>
          )}
          <span className="text-[22px] font-medium text-black">캘린더</span>
        </div>
        {/* 주차 타이틀 + 좌우 이동 */}
        <div className="flex items-center justify-between px-6 py-2">
          <button
            className="p-1 active:opacity-50 transition-opacity"
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(selectedDate.getDate() - 7);
              handleDateClick(prev);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[16px] font-bold text-[#1E2124]">{getWeekLabel(selectedDate)}</span>
          <button
            className="p-1 active:opacity-50 transition-opacity"
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(selectedDate.getDate() + 7);
              handleDateClick(next);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 요일 스트립 (해당 주 월~일 고정) */}
        <div className="flex px-2 py-2 border-b border-[#F9F9FB]">
          {visibleDates.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today) && !isSelected;

            return (
              <button
                key={i}
                className="flex-1 flex flex-col items-center gap-0.5 py-1"
                onClick={() => handleDateClick(date)}
              >
                <span className="text-[12px] font-normal text-[#6D7882]">{DAY_LABELS[i]}</span>
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#1E2124]'
                      : isToday
                        ? 'border border-[#E6E8EA]'
                        : ''
                  }`}
                >
                  <span
                    className={`text-[14px] ${
                      isSelected
                        ? 'font-semibold text-white'
                        : 'font-normal text-[#33363D]'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 수업 리스트 */}
      <div ref={listRef} className="flex flex-col" style={{ paddingBottom: `${bottomPadding}px` }}>
        {visibleDates.map(date => {
          const key = toDateStr(date);
          const dayLessons = lessonsByDate[key] ?? [];
          return (
            <div key={key} ref={el => { dateHeaderRefs.current[key] = el; }}>
              {/* 날짜 헤더 */}
              <div className="px-6 pt-5 pb-2">
                <span className={`text-[14px] font-medium ${isSameDay(date, selectedDate) ? 'text-black font-bold' : 'text-[#33363D]'}`}>
                  {formatDateHeader(date)}
                </span>
              </div>

              {dayLessons.length > 0 ? (
                <div className="flex flex-col gap-2 py-2">
                  {dayLessons.map(lesson => (
                    <NavigateClickWrapper key={lesson.id} method="push" route={KloudScreen.LessonDetail(lesson.id)}>
                      <div className="flex items-center gap-3 px-5 active:bg-[#F9FAFB] transition-colors">
                        {/* 썸네일 */}
                        <div className="w-[52px] h-[92px] rounded-md overflow-hidden flex-shrink-0 bg-[#F1F3F6]">
                          {lesson.thumbnailUrl ? (
                            <Image
                              src={lesson.thumbnailUrl}
                              alt=""
                              width={52}
                              height={92}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#F1F3F6]" />
                          )}
                        </div>

                        {/* 텍스트 */}
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-[16px] font-medium text-[#33363D] line-clamp-2 leading-[150%]">{lesson.title}</span>
                          <div className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="4.5" stroke="#CDD1D5" strokeWidth="1"/>
                              <path d="M6 3.5V6L7.5 7.5" stroke="#CDD1D5" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[12px] font-medium text-[#58616A]">{lesson.startTime}{lesson.endTime ? ` - ${lesson.endTime}` : ''}</span>
                          </div>
                          {lesson.room && (
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1.5C4.067 1.5 2.5 3.067 2.5 5C2.5 7.5 6 10.5 6 10.5C6 10.5 9.5 7.5 9.5 5C9.5 3.067 7.933 1.5 6 1.5Z" stroke="#CDD1D5" strokeWidth="1"/>
                                <circle cx="6" cy="5" r="1.25" stroke="#CDD1D5" strokeWidth="1"/>
                              </svg>
                              <span className="text-[12px] font-medium text-[#58616A]">{lesson.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </NavigateClickWrapper>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="5" y="7" width="26" height="22" rx="4" stroke="#E0E0E0" strokeWidth="1.5"/>
                    <path d="M5 14H31" stroke="#E0E0E0" strokeWidth="1.5"/>
                    <path d="M12 3V8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 3V8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[13px] text-[#B0B3B8] mt-2">수업이 없습니다</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
