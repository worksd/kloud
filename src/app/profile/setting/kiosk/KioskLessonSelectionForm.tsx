'use client';

import React, {useEffect, useState} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import CloseIcon from '../../../../../public/assets/ic_close_black.svg';
import {getLessonsByDate} from './get.lessons.by.date.action';
import {GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {Thumbnail} from '@/app/components/Thumbnail';
import StampCancel from '../../../../../public/assets/stamp_cancel.svg';

type KioskLessonSelectionFormProps = {
  studioName: string;
  onBack: () => void;
  onSelectLessons: (lessons: GetLessonResponse[]) => void;
  studioId: number;
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

// startDate("yyyy-MM-dd HH:mm") + duration(분)으로 시간 문자열 생성
const formatLessonTime = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const timePart = lesson.startDate.split(' ')[1]; // "HH:mm"
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

// startDate("yyyy-MM-dd HH:mm") 또는 date에서 "M/d(요일)" 형식 추출
const formatLessonDate = (lesson: GetLessonResponse): string | null => {
  const raw = lesson.startDate ?? lesson.date;
  if (!raw) return null;
  const datePart = raw.split(' ')[0]; // "yyyy-MM-dd" or "yyyy.MM.dd"
  const parts = datePart.replace(/\./g, '-').split('-').map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const weekday = WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
  return `${m}/${d}(${weekday})`;
};

const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // 이전 달
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({day: d, month: m, year: y, isCurrentMonth: false});
  }

  // 현재 달
  for (let d = 1; d <= lastDate; d++) {
    days.push({day: d, month, year, isCurrentMonth: true});
  }

  // 다음 달 (6주 채우기)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({day: d, month: m, year: y, isCurrentMonth: false});
  }

  return days;
};

export const KioskLessonSelectionForm = ({studioName, onBack, onSelectLessons, studioId}: KioskLessonSelectionFormProps) => {
  const today = getTodayKST();
  const [selectedDate, setSelectedDate] = useState(() => getTodayKST());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedLessons, setSelectedLessons] = useState<GetLessonResponse[]>([]);
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

  const handleLessonToggle = (lesson: GetLessonResponse) => {
    if (lesson.status == LessonStatus.Completed || lesson.status == LessonStatus.Cancelled) return;
    setSelectedLessons((prev) => {
      const exists = prev.find((l) => l.id === lesson.id);
      if (exists) return prev.filter((l) => l.id !== lesson.id);
      return [...prev, lesson];
    });
  };

  const handleRemoveLesson = (lessonId: number) => {
    setSelectedLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleApply = () => {
    if (selectedLessons.length > 0) onSelectLessons(selectedLessons);
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

  const totalPrice = selectedLessons.reduce((sum, l) => sum + (l.price ?? 0), 0);
  const calendarDays = getCalendarDays(calendarYear, calendarMonth);

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="h-[70px] px-[32px] flex items-center justify-between shrink-0 border-b border-gray-100">
          <button onClick={onBack}
                  className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
            <BackArrowIcon className="w-full h-full"/>
          </button>
          <p className="text-black text-[20px] font-bold">수업 선택</p>
          <div className="flex items-center gap-[8px]">
            <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
              {studioName}
            </p>
          </div>
        </div>

        {/* 메인: 왼쪽 달력 + 오른쪽 수업 목록 */}
        <div className="flex-1 flex min-h-0">
          {/* 왼쪽 달력 */}
          <div className="w-[540px] shrink-0 border-r border-gray-100 flex flex-col p-[32px]">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-[20px]">
              <button onClick={handlePrevMonth}
                      className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-gray-100">
                <span className="text-[18px] text-gray-600">{'<'}</span>
              </button>
              <p className="text-black text-[20px] font-bold tracking-[-0.6px]">
                {calendarYear}년 {calendarMonth + 1}월
              </p>
              <button onClick={handleNextMonth}
                      className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-gray-100">
                <span className="text-[18px] text-gray-600">{'>'}</span>
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-[8px]">
              {WEEKDAY_LABELS.map((label, i) => (
                  <div key={label} className="h-[36px] flex items-center justify-center">
                    <p className={`text-[14px] font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-400'}`}>
                      {label}
                    </p>
                  </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 flex-1">
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
                    <div key={idx} className="flex items-center justify-center">
                      <button
                          onClick={() => handleDateClick(dateInfo.day, dateInfo.month, dateInfo.year)}
                          className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all
                            ${isSelected ? 'bg-black' : ''}
                            ${!isSelected && isToday ? 'border-2 border-black' : ''}
                            ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}`}
                      >
                        <p className={`text-[16px] font-medium
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

          {/* 오른쪽 수업 목록 */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* 선택된 날짜 표시 */}
            <div className="px-[32px] py-[16px] flex items-center gap-[12px] shrink-0 border-b border-gray-100">
              <p className="text-black text-[20px] font-bold tracking-[-0.6px]">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({WEEKDAY_LABELS[selectedDate.getDay()]})
              </p>
              <p className="text-gray-400 text-[16px]">
                {lessons.length}개 수업
              </p>
            </div>

            {/* 수업 목록 스크롤 */}
            <div className="flex-1 overflow-y-auto px-[32px] py-[16px] min-h-0">
              {lessons.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-[18px]">수업이 없습니다</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-5 gap-[16px]">
                    {lessons.map((lesson) => {
                      const isSelected = selectedLessons.find((l) => l.id === lesson.id);
                      const isCompleted = lesson.status == LessonStatus.Completed;
                      const isCancelled = lesson.status == LessonStatus.Cancelled;
                      const isDisabled = isCompleted || isCancelled;
                      return (
                          <div
                              key={lesson.id}
                              onClick={() => handleLessonToggle(lesson)}
                              className={`flex flex-col rounded-[16px] cursor-pointer transition-all overflow-hidden
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isSelected ? 'ring-2 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}
                          >
                            {/* 세로 썸네일 */}
                            <div className="w-full aspect-[3/4] rounded-[16px] overflow-hidden relative">
                              {lesson.thumbnailUrl ? (
                                  <Thumbnail url={lesson.thumbnailUrl} className="w-full h-full" aspectRatio={3 / 4}/>
                              ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-3xl">🕺</span>
                                  </div>
                              )}
                              {isSelected && (
                                  <div className="absolute top-[8px] right-[8px] w-[28px] h-[28px] bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-[14px]">✓</span>
                                  </div>
                              )}
                              {isCancelled && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <StampCancel className="w-[70%] h-auto"/>
                                  </div>
                              )}
                              {isCompleted && (
                                  <div className="absolute bottom-0 left-0 w-full h-[32px] bg-black/50 flex items-center justify-center">
                                    <p className="text-white text-[12px] font-semibold">수업 종료</p>
                                  </div>
                              )}
                            </div>

                            {/* 수업 정보 */}
                            <div className="flex flex-col gap-[4px] p-[10px]">
                              <p className="text-black text-[15px] font-bold leading-tight">{lesson.title}</p>
                              {formatLessonTime(lesson) && (
                                  <p className="text-gray-500 text-[13px] font-medium">
                                    {formatLessonTime(lesson)}
                                  </p>
                              )}
                              <p className="text-gray-400 text-[12px]">
                                {[lesson.artists?.[0]?.nickName, lesson.room?.name].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 계산내역 패널 */}
        {selectedLessons.length > 0 && (
            <div className="px-[32px] py-[20px] shrink-0 border-t border-gray-200 bg-white flex gap-[24px]">
              {/* 계산내역 */}
              <div className="flex-1 flex flex-col gap-[8px] overflow-y-auto max-h-[180px]">
                {selectedLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-[8px] flex-1 min-w-0">
                        <p className="text-black text-[15px] font-medium truncate">
                          {lesson.title}
                        </p>
                        <p className="text-gray-400 text-[13px] shrink-0">
                          {[formatLessonDate(lesson), formatLessonTime(lesson)].filter(Boolean).join(' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-[12px] shrink-0">
                        <p className="text-black text-[15px] font-medium">
                          {(lesson.price ?? 0).toLocaleString()}원
                        </p>
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLesson(lesson.id);
                            }}
                            className="w-[24px] h-[24px] flex items-center justify-center"
                        >
                          <CloseIcon className="w-[14px] h-[14px]"/>
                        </button>
                      </div>
                    </div>
                ))}
                {/* 합계 */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-[8px] mt-[4px]">
                  <p className="text-black text-[16px] font-bold">합계 ({selectedLessons.length}건)</p>
                  <p className="text-black text-[20px] font-bold tracking-[-0.6px]">
                    {totalPrice.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* 신청 버튼 */}
              <button
                  onClick={handleApply}
                  className="h-[60px] px-[40px] rounded-[16px] bg-black text-white flex items-center justify-center shrink-0 self-end"
              >
                <p className="text-[20px] font-medium tracking-[-0.6px]">신청하기</p>
              </button>
            </div>
        )}
      </div>
  );
};
