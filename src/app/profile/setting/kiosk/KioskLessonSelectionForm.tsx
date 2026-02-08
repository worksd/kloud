'use client';

import React, {useEffect, useState} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import CloseIcon from '../../../../../public/assets/ic_close_black.svg';
import WarningIcon from '../../../../../public/assets/ic_notification.svg';
import {getLessonsByDate} from './get.lessons.by.date.action';
import {GetBandLessonResponse, GetLessonResponse, LessonStatus} from '@/app/endpoint/lesson.endpoint';
import {Thumbnail} from '@/app/components/Thumbnail';

type Lesson = {
  id: number;
  date: string;
  time: string;
  location: string;
  instructor: string;
  title: string;
  image?: string;
  isEnded: boolean;
};

type KioskLessonSelectionFormProps = {
  onBack: () => void;
  onSelectLessons: (lessons: GetLessonResponse[]) => void;
  studioId: number; // 스튜디오 ID
};

// 날짜를 yyyy.MM.dd 형식으로 변환
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 날짜 포맷팅 함수 (컴포넌트 외부에서도 사용 가능)
const formatDateDisplay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDay = weekDays[date.getDay()];
  return `${year}.${month}.${day}(${weekDay})`;
};

// API 응답을 Lesson 타입으로 변환
const convertToLesson = (bandLesson: GetBandLessonResponse, date: Date): Lesson => {
  const formattedDate = formatDateDisplay(date);

  // date 필드가 있으면 파싱, 없으면 기본값 사용
  const time = '시간 미정';
  const location = bandLesson.studioName || '장소 미정';
  const instructor = '강사 미정';

  // 각 lesson의 상세 정보를 가져와야 할 수도 있지만, 일단 기본 정보만 사용
  // 필요시 GetLesson API를 호출하여 상세 정보 가져오기

  return {
    id: bandLesson.id,
    date: formattedDate,
    time,
    location,
    instructor,
    title: bandLesson.title,
    image: bandLesson.thumbnailUrl,
    isEnded: bandLesson.label?.isEnded || false,
  };
};

// KST 기준 오늘 날짜 가져오기
const getTodayKST = (): Date => {
  const now = new Date();
  // KST는 UTC+9이므로, 로컬 시간대를 사용하되 날짜만 추출
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  // 시간을 0시 0분 0초로 설정하여 날짜만 비교
  return new Date(year, month, day, 0, 0, 0, 0);
};

export const KioskLessonSelectionForm = ({onBack, onSelectLessons, studioId}: KioskLessonSelectionFormProps) => {
  // KST 기준 오늘 날짜로 초기화
  const [selectedDate, setSelectedDate] = useState(() => getTodayKST());
  const [selectedLessons, setSelectedLessons] = useState<GetLessonResponse[]>([]);
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);

  // 날짜 포맷팅 함수 (컴포넌트 내부에서 사용)
  const formatDate = formatDateDisplay;

  // 선택된 날짜를 문자열로 변환 (의존성 배열에서 사용)
  const selectedDateString = React.useMemo(() => formatDateForAPI(selectedDate), [selectedDate]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        console.log('Fetching lessons for date:', selectedDateString, 'studioId:', studioId);
        const response = await getLessonsByDate(studioId, selectedDateString);
        console.log('API Response:', response);

        if ('lessons' in response) {
          console.log('Lessons found:', response.lessons.length);
          // API 응답을 Lesson 타입으로 변환
          const convertedLessons = response.lessons;
          console.log('Converted lessons:', convertedLessons);
          console.log('Setting lessons, count:', convertedLessons.length);
          setLessons(convertedLessons);
        } else {
          // 에러 발생 시 빈 배열 또는 Mock 데이터 사용
          console.error('Failed to fetch lessons - no lessons in response:', response);
          setLessons([]);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        // 에러 발생 시 빈 배열 설정
        setLessons([]);
      }
    };

    fetchLessons();
    // 날짜가 변경되면 선택된 수업 목록 초기화
    setSelectedLessons([]);
  }, [selectedDateString, studioId, selectedDate]);

  const handleDateClick = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day, 0, 0, 0, 0);
    console.log('Date clicked:', formatDateForAPI(newDate));
    setSelectedDate(newDate);
  };

  const handleLessonToggle = (lesson: GetLessonResponse) => {
    if (lesson.status == LessonStatus.Completed) return; // 종료된 수업은 선택 불가

    setSelectedLessons((prev) => {
      const exists = prev.find((l) => l.id === lesson.id);
      if (exists) {
        return prev.filter((l) => l.id !== lesson.id);
      } else {
        return [...prev, lesson];
      }
    });
  };

  const handleRemoveLesson = (lessonId: number) => {
    setSelectedLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleApply = () => {
    if (selectedLessons.length > 0) {
      onSelectLessons(selectedLessons);
    }
  };

  const totalPrice = selectedLessons.length * 130000; // Mock 가격
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const weekRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // 여러 주의 날짜 생성 (현재 주 기준 앞뒤 4주씩)
  const getAllWeeks = () => {
    const weeks: { day: number; month: number; year: number }[][] = [];
    const today = getTodayKST();

    // 오늘을 포함하는 주의 시작일 계산
    const startOfCurrentWeek = new Date(today);
    const day = startOfCurrentWeek.getDay();
    const diff = startOfCurrentWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfCurrentWeek.setDate(diff);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    // 앞뒤 4주씩 총 9주 생성
    for (let weekOffset = -4; weekOffset <= 4; weekOffset++) {
      const weekStart = new Date(startOfCurrentWeek);
      weekStart.setDate(startOfCurrentWeek.getDate() + weekOffset * 7);

      const week: { day: number; month: number; year: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        week.push({
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
        });
      }
      weeks.push(week);
    }
    return weeks;
  };

  const allWeeks = getAllWeeks();

  // 현재 보이는 주의 인덱스 찾기 (선택된 날짜 기준)
  const getCurrentWeekIndex = () => {
    const selectedDateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return allWeeks.findIndex((week) =>
        week.some(
            (date) =>
                date.year === selectedDate.getFullYear() &&
                date.month === selectedDate.getMonth() &&
                date.day === selectedDate.getDate()
        )
    );
  };

  const currentWeekIndex = getCurrentWeekIndex();
  const weekDates = allWeeks[currentWeekIndex] || allWeeks[4]; // 기본값은 중간 주
  const selectedDay = selectedDate.getDate();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const today = getTodayKST();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // 스크롤 시 현재 보이는 주의 월 업데이트
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      // 각 주의 위치 확인
      let visibleWeekIndex = currentWeekIndex;
      let minDistance = Infinity;

      weekRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const weekCenter = rect.left + rect.width / 2;
          const distance = Math.abs(containerCenter - weekCenter);

          if (distance < minDistance) {
            minDistance = distance;
            visibleWeekIndex = index;
          }
        }
      });

      // 현재 보이는 주의 월 업데이트
      if (allWeeks[visibleWeekIndex]) {
        const centerDate = allWeeks[visibleWeekIndex][3]; // 주의 가운데 날짜 (수요일)
        setDisplayMonth(centerDate.month + 1);
        setDisplayYear(centerDate.year);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [allWeeks, currentWeekIndex]);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const weekElement = weekRefs.current.get(currentWeekIndex);
    if (weekElement) {
      const containerWidth = container.offsetWidth;
      const weekLeft = weekElement.offsetLeft;
      const weekWidth = weekElement.offsetWidth;
      const scrollPosition = weekLeft - (containerWidth - weekWidth) / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [currentWeekIndex]);

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="h-[70px] px-[32px] flex items-center justify-between shrink-0">
          <button onClick={onBack}
                  className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
            <BackArrowIcon className="w-full h-full"/>
          </button>
          <div className="flex items-center justify-end gap-[8px] w-[400px]">
            <p className="text-gray-500 text-[16px] text-right tracking-[-0.48px]">
              프로젝트리 댄스학원
            </p>
          </div>
        </div>
        {/* 월/년 표시 */}
        <div className="px-[32px] py-[12px] flex items-center justify-center shrink-0">
          <p className="text-black text-[24px] font-bold text-center tracking-[-0.72px]">
            {displayMonth}월, {displayYear}년
          </p>
        </div>

        {/* 날짜 선택 바 - 스크롤 가능 */}
        <div
            ref={scrollContainerRef}
            className="px-[32px] py-[12px] overflow-x-auto overflow-y-hidden shrink-0 scrollbar-hide"
            style={{scrollSnapType: 'x mandatory'}}
        >
          <div className="flex gap-[40px] min-w-max">
            {allWeeks.map((week, weekIndex) => (
                <div
                    key={weekIndex}
                    ref={(el) => {
                      if (el) weekRefs.current.set(weekIndex, el);
                    }}
                    className="flex items-center justify-between shrink-0"
                    style={{scrollSnapAlign: 'center', width: 'calc(40px * 7)'}}
                >
                  {weekDays.map((day, dayIndex) => {
                    const dateInfo = week[dayIndex];
                    const isSelected =
                        dateInfo.day === selectedDay &&
                        dateInfo.month === selectedMonth &&
                        dateInfo.year === selectedYear;
                    const isToday =
                        dateInfo.day === todayDay &&
                        dateInfo.month === todayMonth &&
                        dateInfo.year === todayYear;
                    const isSunday = dayIndex === 6; // 일요일

                    return (
                        <div key={`${weekIndex}-${dayIndex}`} className="h-[80px] w-[40px] relative">
                          <div className="absolute top-0 left-0 w-[40px] h-[40px] flex items-center justify-center">
                            <p className={`text-[14px] font-semibold ${isSunday ? 'text-red-500' : 'text-gray-500'}`}>
                              {day}
                            </p>
                          </div>
                          <button
                              onClick={() => handleDateClick(dateInfo.day, dateInfo.month, dateInfo.year)}
                              className={`absolute top-[40px] left-0 w-[40px] h-[40px] rounded-full flex items-center justify-center ${
                                  isSelected
                                      ? 'bg-black text-white'
                                      : ''
                              } ${isToday ? 'border-2 border-black' : ''}`}
                          >
                            <p className={`text-[20px] font-semibold ${
                                isSelected
                                    ? 'text-white'
                                    : isSunday
                                        ? 'text-red-500'
                                        : 'text-black'
                            }`}>
                              {dateInfo.day}
                            </p>
                          </button>
                        </div>
                    );
                  })}
                </div>
            ))}
          </div>
        </div>

        {/* 날짜 및 경고 메시지 */}
        <div className="pl-[40px] pr-[32px] py-[12px] flex items-center gap-[12px] shrink-0">
          <p className="text-black text-[20px] font-bold tracking-[-0.6px]">
            {formatDate(selectedDate)}
          </p>
          <div className="bg-[#fff6e9] rounded-[4px] p-[6px] flex items-center gap-[3px]">
            <WarningIcon className="w-[16px] h-[16px]"/>
            <p className="text-[#987e5d] text-[12px] text-center">
              종료된 수업은 선택이 불가능해요!
            </p>
          </div>
        </div>

        {/* 수업 목록 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto px-[32px] py-0 min-h-0 relative z-10">
          {lessons.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-[18px]">수업이 없습니다</p>
              </div>
          ) : (
              <div className="grid grid-cols-4 gap-[20px] py-[12px]">
                {lessons.map((lesson) => {
                  const isSelected = selectedLessons.find((l) => l.id === lesson.id);
                  return (
                      <div
                          key={lesson.id}
                          onClick={() => handleLessonToggle(lesson)}
                          className={`flex flex-col gap-[12px] items-start pb-[12px] pt-[8px] px-[8px] rounded-[20px] cursor-pointer transition-all ${
                              isSelected
                                  ? 'bg-gray-100 border-2 border-black'
                                  : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className="h-[200px] w-full rounded-[16px] overflow-hidden relative">
                          {lesson.thumbnailUrl ? (
                              <Thumbnail
                                  url={lesson.thumbnailUrl}
                                  className="w-full h-full"
                                  aspectRatio={167 / 222}
                              />
                          ) : (
                              <div
                                  className="w-full h-full bg-gray-200 rounded-[16px] flex items-center justify-center">
                                <span className="text-gray-400 text-3xl">🕺</span>
                              </div>
                          )}
                          {isSelected && (
                              <div
                                  className="absolute top-2 right-2 w-[24px] h-[24px] bg-black rounded-full flex items-center justify-center z-10">
                                <span className="text-white text-[14px]">✓</span>
                              </div>
                          )}
                          {lesson.status == LessonStatus.Completed && (
                              <div
                                  className="absolute bottom-0 left-0 w-full h-[36px] bg-black/50 flex items-center justify-center z-10">
                                <p className="text-white text-[12px] font-semibold">수업 종료</p>
                              </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-[6px] items-start px-[2px]">
                          <p className="text-gray-500 text-[16px] font-bold">{lesson.title}</p>
                          <p className="text-[#6b6e71] text-[14px] font-medium">{lesson.date}</p>
                          <p className="text-gray-400 text-[12px] font-medium">{lesson.room?.name}</p>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>

        {/* 하단 선택된 수업 및 신청 버튼 */}
        <div
            className="p-[24px] flex items-center justify-between shrink-0 border-t border-gray-200 bg-white relative z-20">
          {/* 선택된 수업 목록 */}
          <div className="bg-gray-100 rounded-[20px] h-[180px] w-[500px] overflow-y-auto pt-[16px]">
            {selectedLessons.length === 0 ? (
                <div className="px-[20px] py-0 flex items-center justify-center h-full">
                  <p className="text-gray-500 text-[18px]">선택된 수업이 없습니다</p>
                </div>
            ) : (
                selectedLessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className="h-[48px] px-[20px] py-0 flex items-center justify-between"
                    >
                      <p className="text-gray-500 text-[18px] font-medium tracking-[-0.54px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {lesson.date} / {lesson.room?.name} / {lesson.artists?.[0]?.name}
                      </p>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLesson(lesson.id);
                          }}
                          className="w-[36px] h-[36px] flex items-center justify-center"
                      >
                        <CloseIcon className="w-[20px] h-[20px]"/>
                      </button>
                    </div>
                ))
            )}
          </div>

          {/* 총액 및 신청 버튼 */}
          <div className="h-[180px] w-[280px] relative">
            <div className="absolute top-0 left-0 px-[8px] py-0 flex flex-col items-start">
              <p className="text-gray-500 text-[16px] font-medium tracking-[-0.48px]">
                총 {selectedLessons.length}건
              </p>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {totalPrice.toLocaleString()}원
              </p>
            </div>
            <button
                onClick={handleApply}
                disabled={selectedLessons.length === 0}
                className={`absolute bottom-0 right-0 h-[100px] w-[280px] rounded-[20px] flex items-center justify-center ${
                    selectedLessons.length > 0
                        ? 'bg-black text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <p className="text-[24px] font-medium tracking-[-0.72px]">신청하기</p>
            </button>
          </div>
        </div>
      </div>
  );
};

