'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { PracticeRoomView } from "@/app/schedule/PracticeRoomView";
import { ScheduleTabView, CalendarLesson } from "@/app/schedule/ScheduleTabView";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { getWeeklyLessonsAction } from "@/app/schedule/get.weekly.lessons.action";

type ScheduleTab = 'lesson' | 'practice';

const getWeekdays = (locale: Locale) => {
  const keys = ['weekday_sun', 'weekday_mon', 'weekday_tue', 'weekday_wed', 'weekday_thu', 'weekday_fri', 'weekday_sat'] as const;
  return keys.map(k => getLocaleString({ locale, key: k }));
};

const formatShortDate = (d: Date, locale: Locale) => {
  const wd = getWeekdays(locale)[d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${wd})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateForApi = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  return d;
};

const getSunday = (monday: Date) => {
  const d = new Date(monday);
  d.setDate(monday.getDate() + 6);
  return d;
};

const parseLessons = (rawLessons: any[]): CalendarLesson[] =>
  rawLessons.map((l: any) => {
    const parts = (l.startDate ?? '').split(' ');
    const datePart = (parts[0] ?? '').replace(/\./g, '-');
    const timePart = parts[1] ?? '';
    return {
      id: l.id,
      title: l.title,
      thumbnailUrl: l.thumbnailUrl ?? '',
      startTime: timePart,
      endTime: '',
      room: l.room?.name,
      date: datePart,
    };
  });

export const SchedulePageClient = ({
  studioImageUrl,
  locale,
  lessons: initialLessons,
  studioName,
}: {
  studioImageUrl?: string;
  locale: Locale;
  lessons: CalendarLesson[];
  studioName?: string;
}) => {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('lesson');
  const scrollPositions = useRef<Record<ScheduleTab, number>>({ lesson: 0, practice: 0 });
  const today = useMemo(() => new Date(), []);

  const switchTab = useCallback((tab: ScheduleTab) => {
    if (tab === activeTab) return;
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositions.current[tab]);
    });
  }, [activeTab]);

  // 수업 탭 상태 (부모에서 관리 → unmount 돼도 유지)
  const [lessonSelectedDate, setLessonSelectedDate] = useState(today);
  const [lessons, setLessons] = useState(initialLessons);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // 주차 변경 시 API 호출
  const weekKey = useMemo(() => {
    const mon = getMonday(lessonSelectedDate);
    const sun = getSunday(mon);
    return `${formatDateForApi(mon)}-${formatDateForApi(sun)}`;
  }, [lessonSelectedDate]);

  const prevWeekKey = React.useRef(weekKey);
  useEffect(() => {
    if (weekKey === prevWeekKey.current) return;
    prevWeekKey.current = weekKey;
    const [start, end] = weekKey.split('-');
    setLoadingLessons(true);
    getWeeklyLessonsAction(start, end)
      .then(res => { if ('lessons' in res) setLessons(parseLessons(res.lessons)); })
      .catch(() => {})
      .finally(() => setLoadingLessons(false));
  }, [weekKey]);

  // 연습실 탭 상태
  const [practiceDate, setPracticeDate] = useState(today);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [closingSheet, setClosingSheet] = useState(false);

  const closeSheet = () => {
    setClosingSheet(true);
    setTimeout(() => {
      setShowDateSheet(false);
      setClosingSheet(false);
    }, 150);
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 (sticky) */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-4">
          {studioImageUrl && (
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <Image src={studioImageUrl} alt="" width={28} height={28} className="object-cover w-full h-full" />
            </div>
          )}
          <button
            onClick={() => switchTab('lesson')}
            className={`transition-all duration-200 ${
              activeTab === 'lesson'
                ? 'text-[20px] text-black font-bold'
                : 'text-[16px] text-gray-400 font-medium'
            }`}
          >
            {getLocaleString({ locale, key: 'lesson_tab' })}
          </button>
          <button
            onClick={() => switchTab('practice')}
            className={`transition-all duration-200 ${
              activeTab === 'practice'
                ? 'text-[20px] text-black font-bold'
                : 'text-[16px] text-gray-400 font-medium'
            }`}
          >
            {getLocaleString({ locale, key: 'practice_room_tab' })}
          </button>
        </div>

        {activeTab === 'lesson' && (
          <button
            onClick={() => setLessonSelectedDate(getMonday(today))}
            className="px-3 py-1.5 rounded-full border border-[#E6E8EA] active:bg-[#F9FAFB] transition-colors"
          >
            <span className="text-[13px] font-medium text-black">{getLocaleString({ locale, key: 'this_week' })}</span>
          </button>
        )}
        {activeTab === 'practice' && (
          <button
            onClick={() => setShowDateSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E8EA] active:bg-[#F9FAFB] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#333" strokeWidth="1.1"/>
              <path d="M1.5 5.5H12.5" stroke="#333" strokeWidth="1.1"/>
              <path d="M4.5 1V3" stroke="#333" strokeWidth="1.1" strokeLinecap="round"/>
              <path d="M9.5 1V3" stroke="#333" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            <span className="text-[13px] font-medium text-black">{formatShortDate(practiceDate, locale)}</span>
          </button>
        )}
      </div>

      {/* 탭 콘텐츠 - hidden으로 둘 다 마운트 유지 */}
      <div className={activeTab === 'lesson' ? '' : 'hidden'}>
        <ScheduleTabView
          lessons={lessons}
          studioName={studioName}
          studioImageUrl={studioImageUrl}
          locale={locale}
          selectedDate={lessonSelectedDate}
          onDateChange={setLessonSelectedDate}
          loading={loadingLessons}
          active={activeTab === 'lesson'}
        />
      </div>
      <div className={activeTab === 'practice' ? '' : 'hidden'}>
        <PracticeRoomView selectedDate={practiceDate} onChangeDate={setPracticeDate} locale={locale} />
      </div>

      {/* 날짜 선택 달력 바텀시트 */}
      {showDateSheet && (
        <CalendarSheet
          selectedDate={practiceDate}
          today={today}
          closing={closingSheet}
          onSelect={(date) => { setPracticeDate(date); closeSheet(); }}
          onClose={closeSheet}
          locale={locale}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
      `}</style>
    </div>
  );
};

// 달력 바텀시트
const CalendarSheet = ({
  selectedDate,
  today,
  closing,
  onSelect,
  onClose,
  locale,
}: {
  selectedDate: Date;
  today: Date;
  closing: boolean;
  onSelect: (date: Date) => void;
  onClose: () => void;
  locale: Locale;
}) => {
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className={`absolute inset-0 bg-black/40 ${closing ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-8 ${closing ? 'animate-[slideDown_150ms_ease-in_forwards]' : 'animate-[slideUp_150ms_ease-out]'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#DDD]" />
        </div>

        <div className="flex items-center justify-between px-6 py-2">
          <button onClick={goPrev} className="p-1 active:opacity-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[16px] font-bold text-[#1E2124]">
            {locale === 'en'
              ? `${viewYear} / ${viewMonth + 1}`
              : `${viewYear}${getLocaleString({ locale, key: 'year_format' })} ${viewMonth + 1}${getLocaleString({ locale, key: 'month_format' })}`}
          </span>
          <button onClick={goNext} className="p-1 active:opacity-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="#464C53" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 px-6">
          {getWeekdays(locale).map(d => (
            <div key={d} className="flex items-center justify-center py-2">
              <span className="text-[12px] text-[#9CA3AF] font-medium">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-6 pb-4">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const date = new Date(viewYear, viewMonth, day);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <button
                key={i}
                onClick={() => !isPast && onSelect(date)}
                disabled={isPast}
                className="flex items-center justify-center py-1.5"
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  isSelected ? 'bg-[#1E2124]'
                    : isToday ? 'border border-[#E6E8EA]'
                      : ''
                }`}>
                  <span className={`text-[14px] ${
                    isPast ? 'text-[#D1D5DB]'
                      : isSelected ? 'font-semibold text-white'
                        : 'text-[#33363D]'
                  }`}>
                    {day}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
