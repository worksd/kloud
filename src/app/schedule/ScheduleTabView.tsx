'use client'

import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { TodayTimetable, TimetableLesson } from "@/app/home/TodayTimetable";

export type CalendarLesson = {
  id: number;
  title: string;
  thumbnailUrl: string;
  startTime: string;
  endTime: string;
  room?: string;
  date: string; // yyyy-MM-dd
  /** ','로 구분된 태그 문자열 (예: '전문반,입시반'). null/undefined면 미노출. */
  tags?: string;
  /** 수업 길이(분). 진행중/종료 판단용. */
  duration?: number;
  /** 대표 강사명 (nickName ?? name). */
  artistName?: string;
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const getWeekLabel = (date: Date, locale: Locale): string => {
  const month = date.getMonth() + 1;
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const weekNum = Math.ceil((date.getDate() + ((firstDay.getDay() + 6) % 7)) / 7);
  const weekKeys = ['week_1', 'week_2', 'week_3', 'week_4', 'week_5', 'week_6'] as const;
  const weekLabel = getLocaleString({ locale, key: weekKeys[weekNum - 1] ?? 'week_1' });
  const monthSuffix = getLocaleString({ locale, key: 'month_format' });
  return locale === 'en' ? `${weekLabel}, ${month}` : `${month}${monthSuffix} ${weekLabel}`;
};

const getWeekdays = (locale: Locale) => {
  const keys = ['weekday_sun', 'weekday_mon', 'weekday_tue', 'weekday_wed', 'weekday_thu', 'weekday_fri', 'weekday_sat'] as const;
  return keys.map(k => getLocaleString({ locale, key: k }));
};

const formatDateHeader = (date: Date, locale: Locale): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = getWeekdays(locale);
  const wd = weekdays[date.getDay()];
  const monthSuffix = getLocaleString({ locale, key: 'month_format' });
  const daySuffix = getLocaleString({ locale, key: 'day_format' });
  if (locale === 'en') return `${month}/${day} (${wd})`;
  return `${month}${monthSuffix} ${day}${daySuffix} (${wd})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// CalendarLesson → TodayTimetable이 받는 TimetableLesson 형태로 변환.
const toTimetableLesson = (l: CalendarLesson): TimetableLesson => ({
  id: l.id,
  title: l.title,
  thumbnailUrl: l.thumbnailUrl,
  startDate: l.date && l.startTime ? `${l.date} ${l.startTime}` : undefined,
  duration: l.duration,
  roomName: l.room,
  tags: l.tags,
  artist: l.artistName ? { nickName: l.artistName } : undefined,
});

export const ScheduleTabView = ({ lessons, studioName, studioImageUrl, locale = 'ko', selectedDate, onDateChange, loading, active = true }: {
  lessons: CalendarLesson[],
  studioName?: string,
  studioImageUrl?: string,
  locale?: Locale,
  selectedDate: Date,
  onDateChange: (date: Date) => void,
  loading?: boolean,
  active?: boolean,
}) => {
  const today = useMemo(() => new Date(), []);
  const listRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const dateHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [bottomPadding, setBottomPadding] = useState(0);

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
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [lessons]);

  // 날짜 클릭 시 해당 섹션으로 스크롤
  const scrollToDate = useCallback((date: Date) => {
    const key = toDateStr(date);
    const el = dateHeaderRefs.current[key];
    if (el) {
      const stickyOffset = stickyRef.current?.getBoundingClientRect().height ?? 160;
      const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset - 52;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    isClickScrolling.current = true;
    onDateChange(date);
    setTimeout(() => scrollToDate(date), 50);
    setTimeout(() => { isClickScrolling.current = false; }, 800);
  }, [onDateChange, scrollToDate]);

  // 스크롤 시 현재 보이는 날짜 감지 → 요일 스트립 업데이트
  const isClickScrolling = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      if (!active || isClickScrolling.current) return;

      const stickyOffset = (stickyRef.current?.getBoundingClientRect().height ?? 160) + 52;
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
          onDateChange(date);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedDate, onDateChange, active]);

  // 마지막 날짜까지 스크롤 가능하도록 하단 패딩 계산
  useEffect(() => {
    const calculate = () => {
      const lastKey = toDateStr(visibleDates[visibleDates.length - 1]);
      const lastEl = dateHeaderRefs.current[lastKey];
      if (!lastEl) return;

      const stickyHeight = (stickyRef.current?.getBoundingClientRect().height ?? 120) + 52;
      const viewportHeight = window.innerHeight;
      const lastSectionHeight = lastEl.getBoundingClientRect().height;
      const needed = Math.max(0, viewportHeight - stickyHeight - lastSectionHeight);
      setBottomPadding(needed);
    };
    requestAnimationFrame(calculate);
  }, [visibleDates, lessons]);

  // 마운트 시 selectedDate 섹션으로 스크롤 (한 번만)
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    setTimeout(() => scrollToDate(selectedDate), 300);
  }, []);

  return (
    <div className="flex flex-col">
      {/* 주간 선택기 (sticky) */}
      <div ref={stickyRef} className="sticky top-[52px] z-10 bg-white">
        {/* 주차 타이틀 + 좌우 이동 */}
        <div className="flex items-center justify-between px-6 py-2">
          <button
            className="p-1 active:opacity-50 transition-opacity"
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(selectedDate.getDate() - 7);
              onDateChange(prev);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[16px] font-bold text-[#1E2124]">{getWeekLabel(selectedDate, locale)}</span>
          <button
            className="p-1 active:opacity-50 transition-opacity"
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(selectedDate.getDate() + 7);
              onDateChange(next);
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
                <span className="text-[12px] font-normal text-[#6D7882] font-paperlogy">{DAY_LABELS[i]}</span>
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
            <div key={key} ref={el => { dateHeaderRefs.current[key] = el; }} className="[&:not(:first-child)]:border-t border-[#F0F0F0]">
              {/* 날짜 헤더 */}
              <div className="px-6 pt-5 pb-2">
                <span className={`text-[16px] font-bold ${isSameDay(date, selectedDate) ? 'text-black' : 'text-[#33363D]'}`}>
                  {formatDateHeader(date, locale)}
                </span>
              </div>

              {dayLessons.length > 0 ? (
                <TodayTimetable
                  lessons={dayLessons.map(toTimetableLesson)}
                  endedLabel={getLocaleString({ locale, key: 'finish' })}
                  ongoingLabel={getLocaleString({ locale, key: 'in_progress' })}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="5" y="7" width="26" height="22" rx="4" stroke="#E0E0E0" strokeWidth="1.5"/>
                    <path d="M5 14H31" stroke="#E0E0E0" strokeWidth="1.5"/>
                    <path d="M12 3V8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 3V8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[13px] text-[#B0B3B8] mt-2">{getLocaleString({ locale, key: 'schedule_no_lessons' })}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
