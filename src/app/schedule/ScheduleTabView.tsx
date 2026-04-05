'use client'

import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export type CalendarLesson = {
  id: number;
  title: string;
  thumbnailUrl: string;
  startTime: string;
  endTime: string;
  room?: string;
  date: string; // yyyy-MM-dd
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

const formatAmPm = (time: string, locale: Locale): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const amLabel = getLocaleString({ locale, key: 'am' });
  const pmLabel = getLocaleString({ locale, key: 'pm' });
  const period = h < 12 ? amLabel : pmLabel;
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

export const ScheduleTabView = ({ lessons, studioName, studioImageUrl, locale = 'ko', selectedDate, onDateChange, loading }: {
  lessons: CalendarLesson[],
  studioName?: string,
  studioImageUrl?: string,
  locale?: Locale,
  selectedDate: Date,
  onDateChange: (date: Date) => void,
  loading?: boolean,
}) => {
  const today = useMemo(() => new Date(), []);
  const listRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const dateHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    onDateChange(date);
    // 같은 주 내 클릭이면 해당 섹션으로 스크롤
    setTimeout(() => scrollToDate(date), 50);
  }, [onDateChange, scrollToDate]);

  // 마운트 시 selectedDate 섹션으로 스크롤 (한 번만)
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    setTimeout(() => scrollToDate(selectedDate), 300);
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-screen">
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
          <span className="text-[16px] font-bold text-[#1E2124]">{getWeekLabel(selectedDate)}</span>
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
      <div ref={listRef} className="flex flex-col pb-20">
        {visibleDates.map(date => {
          const key = toDateStr(date);
          const dayLessons = lessonsByDate[key] ?? [];
          return (
            <div key={key} ref={el => { dateHeaderRefs.current[key] = el; }} className="[&:not(:first-child)]:border-t border-[#F0F0F0]">
              {/* 날짜 헤더 */}
              <div className="px-6 pt-5 pb-2">
                <span className={`text-[16px] font-bold ${isSameDay(date, selectedDate) ? 'text-black' : 'text-[#33363D]'}`}>
                  {formatDateHeader(date)}
                </span>
              </div>

              {dayLessons.length > 0 ? (
                <div className="flex flex-col gap-2 py-2">
                  {dayLessons.map(lesson => (
                    <NavigateClickWrapper key={lesson.id} method="push" route={KloudScreen.LessonDetail(lesson.id)}>
                      <div className="flex items-start gap-3 px-5 py-2 active:bg-[#F3F4F6] transition-colors rounded-xl mx-2">
                        <div className="w-[64px] h-[96px] rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F3F6] select-none pointer-events-none">
                          {lesson.thumbnailUrl ? (
                            <Image
                              src={lesson.thumbnailUrl}
                              alt=""
                              width={64}
                              height={96}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#F1F3F6]" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-[16px] font-medium text-[#33363D] line-clamp-2 leading-[150%]">{lesson.title}</span>
                          <div className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="4.5" stroke="#CDD1D5" strokeWidth="1"/>
                              <path d="M6 3.5V6L7.5 7.5" stroke="#CDD1D5" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[12px] font-medium text-[#58616A]">{formatAmPm(lesson.startTime, locale)}</span>
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
