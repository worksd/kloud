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
  studioId,
}: {
  studioImageUrl?: string;
  locale: Locale;
  lessons: CalendarLesson[];
  studioName?: string;
  studioId?: number;
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
        <PracticeRoomView selectedDate={practiceDate} onChangeDate={setPracticeDate} locale={locale} studioId={studioId} />
      </div>

    </div>
  );
};
