'use client';

import React, {useEffect, useState} from 'react';
import {getLessonsByDate} from '@/app/profile/setting/kiosk/get.lessons.by.date.action';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {Thumbnail} from '@/app/components/Thumbnail';
import {kloudNav} from '@/app/lib/kloudNav';
import {KloudScreen} from '@/shared/kloud.screen';

type QRLessonSelectFormProps = {
  studioId: number;
  studioName: string;
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getTodayKST = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const formatLessonTime = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const timePart = lesson.startDate.split(' ')[1];
    if (timePart) {
      const start = toAmPm(timePart);
      if (lesson.duration) {
        const [h, m] = timePart.split(':').map(Number);
        const endMinutes = h * 60 + m + lesson.duration;
        const endH = Math.floor(endMinutes / 60) % 24;
        const endM = endMinutes % 60;
        const end = toAmPm(`${endH}:${String(endM).padStart(2, '0')}`);
        return `${start} - ${end}`;
      }
      return start;
    }
  }
  if (lesson.formattedDate) {
    return `${toAmPm(lesson.formattedDate.startTime)} - ${toAmPm(lesson.formattedDate.endTime)}`;
  }
  return null;
};

const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({day: d, month: m, year: y, isCurrentMonth: false});
  }

  for (let d = 1; d <= lastDate; d++) {
    days.push({day: d, month, year, isCurrentMonth: true});
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({day: d, month: m, year: y, isCurrentMonth: false});
  }

  return days;
};

export const QRLessonSelectForm = ({studioId}: QRLessonSelectFormProps) => {
  const today = getTodayKST();
  const [showDialog, setShowDialog] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getTodayKST());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);

  const selectedDateString = React.useMemo(() => formatDateForAPI(selectedDate), [selectedDate]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await getLessonsByDate(studioId, selectedDateString);
        if ('lessons' in response) {
          setLessons(response.lessons);
        } else {
          setLessons([]);
        }
      } catch {
        setLessons([]);
      }
    };
    fetchLessons();
  }, [selectedDateString, studioId]);

  const handleDateClick = (day: number, month: number, year: number) => {
    setSelectedDate(new Date(year, month, day, 0, 0, 0, 0));
  };

  const handleLessonClick = (lesson: GetLessonResponse) => {
    kloudNav.push(KloudScreen.QRScanWithLesson(lesson.id));
  };

  const handleCancel = () => {
    setShowDialog(false);
    kloudNav.push(KloudScreen.QRScan);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const calendarDays = getCalendarDays(calendarYear, calendarMonth);
  const filteredLessons = lessons.filter((l) => l.status !== LessonStatus.Cancelled && l.price != null);

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      {/* 백드롭 클릭 → 취소 */}
      <div className="absolute inset-0" onClick={handleCancel}/>

      {/* 바텀시트 다이얼로그 */}
      <div className="relative bg-white w-full max-h-[85vh] rounded-t-[20px] flex flex-col">
        {/* 핸들바 + 헤더 */}
        <div className="shrink-0 pt-3 pb-2 px-5">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3"/>
          <div className="flex items-center justify-between">
            <p className="text-black text-[17px] font-bold">수업 선택</p>
            <button
              onClick={handleCancel}
              className="text-gray-400 text-[14px] active:opacity-70"
            >
              건너뛰기
            </button>
          </div>
        </div>

        {/* 달력 영역 */}
        <div className="shrink-0 px-5 pt-2 pb-2">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={handlePrevMonth}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-gray-100">
              <span className="text-[16px] text-gray-600">{'<'}</span>
            </button>
            <p className="text-black text-[15px] font-bold tracking-[-0.45px]">
              {calendarYear}년 {calendarMonth + 1}월
            </p>
            <button onClick={handleNextMonth}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-gray-100">
              <span className="text-[16px] text-gray-600">{'>'}</span>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={label} className="h-[24px] flex items-center justify-center">
                <p className={`text-[11px] font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-400'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dateInfo, idx) => {
              const isSelected =
                dateInfo.day === selectedDate.getDate() &&
                dateInfo.month === selectedDate.getMonth() &&
                dateInfo.year === selectedDate.getFullYear();
              const isToday =
                dateInfo.day === todayDay &&
                dateInfo.month === todayMonth &&
                dateInfo.year === todayYear;
              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;

              return (
                <div key={idx} className="flex items-center justify-center py-[1px]">
                  <button
                    onClick={() => handleDateClick(dateInfo.day, dateInfo.month, dateInfo.year)}
                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all
                      ${isSelected ? 'bg-black' : ''}
                      ${!isSelected && isToday ? 'border-2 border-black' : ''}
                      ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}`}
                  >
                    <p className={`text-[12px] font-medium
                      ${isSelected ? 'text-white font-bold' : ''}
                      ${!isSelected && !dateInfo.isCurrentMonth ? 'text-gray-300' : ''}
                      ${!isSelected && dateInfo.isCurrentMonth && isSunday ? 'text-red-500' : ''}
                      ${!isSelected && dateInfo.isCurrentMonth && isSaturday ? 'text-blue-500' : ''}
                      ${!isSelected && dateInfo.isCurrentMonth && !isSunday && !isSaturday ? 'text-black' : ''}
                    `}>
                      {dateInfo.day}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 날짜 + 수업 수 */}
        <div className="px-5 py-2 flex items-center gap-2 shrink-0 border-t border-gray-100">
          <p className="text-black text-[14px] font-bold">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({WEEKDAY_LABELS[selectedDate.getDay()]})
          </p>
          <p className="text-gray-400 text-[12px]">
            {filteredLessons.length}개 수업
          </p>
        </div>

        {/* 수업 목록 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 min-h-0">
          {filteredLessons.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-400 text-[13px]">수업이 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className="flex items-center gap-3 p-3 rounded-[12px] cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-all"
                >
                  <div className="w-[44px] h-[44px] rounded-[10px] overflow-hidden shrink-0">
                    {lesson.thumbnailUrl ? (
                      <Thumbnail url={lesson.thumbnailUrl} className="w-full h-full" aspectRatio={1}/>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-base">🕺</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <p className="text-black text-[14px] font-bold truncate">{lesson.title}</p>
                    {formatLessonTime(lesson) && (
                      <p className="text-gray-500 text-[12px]">
                        {formatLessonTime(lesson)}
                      </p>
                    )}
                    <p className="text-gray-400 text-[11px]">
                      {[lesson.artists?.[0]?.nickName, lesson.room?.name].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
