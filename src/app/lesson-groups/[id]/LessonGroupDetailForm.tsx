'use client';

import Image from "next/image";
import { GetLessonGroupResponse, GetBandLessonResponse, GetLessonResponse, LessonStatus, GetLessonButtonResponse } from "@/app/endpoint/lesson.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import LeftArrow from "../../../../public/assets/left-arrow.svg";
import ChevronLeft from "../../../../public/assets/ic_simple_left_arrow.svg";
import ChevronRight from "../../../../public/assets/ic_simple_right_arrow.svg";
import CloseIcon from "../../../../public/assets/ic_close.svg";
import InstagramIcon from "../../../../public/assets/instagram-colored.svg";
import { LessonLabel, LessonLevelLabel } from "@/app/components/LessonLabel";
import { CircleImage } from "@/app/components/CircleImage";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";
import { useState, useEffect, useMemo } from "react";
import { getLessonGroupLessonsAction } from "./getLessonGroupLessonsAction";
import { getLessonDetailAction } from "./getLessonDetailAction";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { useRouter } from "next/navigation";

// 버튼 활성화 시간 파싱
function parseKstLocalToEpoch(activateAt: string): number {
  const [d, t] = activateAt.trim().split(' ');
  const [Y, M, D] = d.split('.').map(Number);
  const [h, m, sStr] = t.split(':');
  const hh = Number(h), mm = Number(m), ss = Number(sStr ?? 0);
  return Date.UTC(Y, M - 1, D, hh - 9, mm, ss);
}

function pickAvailableButton(
  buttons: GetLessonButtonResponse[],
  nowUtcMs: number
): GetLessonButtonResponse | null {
  let latest: { btn: GetLessonButtonResponse; ts: number } | null = null;
  for (const btn of buttons) {
    const ts = parseKstLocalToEpoch(btn.activateAt);
    if (!Number.isFinite(ts) || ts > nowUtcMs) continue;
    if (!latest || ts > latest.ts) latest = { btn, ts };
  }
  return latest ? latest.btn : null;
}

export default function LessonGroupDetailForm({
  lessonGroup,
  initialLessons,
  locale,
  appVersion,
}: {
  lessonGroup: GetLessonGroupResponse;
  initialLessons: GetBandLessonResponse[];
  locale: Locale;
  appVersion: string;
}) {
  const now = new Date();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [lessons, setLessons] = useState<GetBandLessonResponse[]>(initialLessons);
  const [isLoading, setIsLoading] = useState(false);

  // 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<GetLessonResponse | null>(null);
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return '';
    const dayMap: Record<string, string> = {
      'MONDAY': '월', 'MON': '월',
      'TUESDAY': '화', 'TUE': '화',
      'WEDNESDAY': '수', 'WED': '수',
      'THURSDAY': '목', 'THU': '목',
      'FRIDAY': '금', 'FRI': '금',
      'SATURDAY': '토', 'SAT': '토',
      'SUNDAY': '일', 'SUN': '일',
    };
    return days.map(d => dayMap[d] || d).join(', ');
  };

  // 버튼 클릭 핸들러
  const handleButtonClick = (route?: string) => {
    if (!route) return;
    if (appVersion === '') {
      router.push(route);
    } else {
      kloudNav.push(route);
    }
  };

  // 활성화된 버튼
  const availableButton = useMemo(() => {
    if (!lessonGroup.buttons || lessonGroup.buttons.length === 0) return null;
    return pickAvailableButton(lessonGroup.buttons, Date.now());
  }, [lessonGroup.buttons]);

  // 월별 수업 가져오기
  const fetchLessons = async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const res = await getLessonGroupLessonsAction({
        id: lessonGroup.id,
        year,
        month,
      });
      if ('lessons' in res) {
        setLessons(res.lessons);
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 월 변경 시 수업 다시 가져오기
  useEffect(() => {
    fetchLessons(currentYear, currentMonth);
  }, [currentYear, currentMonth, lessonGroup.id]);

  // 이전/다음 달 이동
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // 수업 클릭 시 다이얼로그 열기
  const handleLessonClick = async (lessonId: number) => {
    setIsDialogOpen(true);
    setIsDialogLoading(true);
    try {
      const res = await getLessonDetailAction({ lessonId });
      if (!isGuinnessErrorCase(res)) {
        setSelectedLesson(res);
      }
    } catch (err) {
      console.error('Failed to fetch lesson detail:', err);
    } finally {
      setIsDialogLoading(false);
    }
  };

  // 다이얼로그 닫기
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedLesson(null);
  };

  // 상태별 색상 반환
  const getStatusColor = (status?: LessonStatus) => {
    switch (status) {
      case LessonStatus.Completed:
        return 'bg-gray-400';
      case LessonStatus.Cancelled:
        return 'bg-red-400';
      case LessonStatus.Recruiting:
      case LessonStatus.PreSale:
        return 'bg-green-500';
      case LessonStatus.Ready:
        return 'bg-blue-500';
      default:
        return 'bg-black';
    }
  };

  // 인스타그램 클릭 핸들러
  const handleInstagramClick = () => {
    if (!lessonGroup.artist?.instagramAddress) return;
    const url = `https://www.instagram.com/${lessonGroup.artist.instagramAddress}`;
    if (appVersion !== '') {
      (window as any).KloudEvent.openExternalBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // startDate "2026.01.01 15:00" -> "2026-01-01" 변환
  const parseStartDate = (startDate: string): string => {
    const datePart = startDate.split(' ')[0]; // "2026.01.01"
    return datePart.replace(/\./g, '-'); // "2026-01-01"
  };

  // startDate "2026.01.01 15:00" -> "15:00" 추출
  const parseStartTime = (startDate: string): string => {
    const parts = startDate.split(' ');
    return parts[1] || ''; // "15:00"
  };

  // 다음 수업 찾기
  const nextLesson = useMemo(() => {
    const todayStr = today;
    const upcomingLessons = lessons
      .filter(lesson => {
        if (!lesson.startDate) return false;
        const lessonDateStr = parseStartDate(lesson.startDate);
        return lessonDateStr >= todayStr && lesson.status !== LessonStatus.Completed && lesson.status !== LessonStatus.Cancelled;
      })
      .sort((a, b) => {
        const dateA = a.startDate ? parseStartDate(a.startDate) : '';
        const dateB = b.startDate ? parseStartDate(b.startDate) : '';
        return dateA.localeCompare(dateB);
      });
    return upcomingLessons[0] || null;
  }, [lessons, today]);

  // 날짜별 수업 매핑
  const lessonsByDate = useMemo(() => {
    const map: Record<string, GetBandLessonResponse[]> = {};
    lessons.forEach(lesson => {
      if (lesson.startDate) {
        const dateKey = parseStartDate(lesson.startDate);
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(lesson);
      }
    });
    return map;
  }, [lessons]);

  // 캘린더에 표시할 주 단위 데이터 생성
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const weeks: { date: number; dateStr: string; isCurrentMonth: boolean }[][] = [];
    let currentWeek: { date: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // 이전 달의 날짜들
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      currentWeek.push({
        date,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({
        date: i,
        dateStr: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜들 (현재 주 채우기)
    let nextDate = 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    while (currentWeek.length < 7) {
      currentWeek.push({
        date: nextDate,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDate).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
      nextDate++;
    }
    weeks.push(currentWeek);

    // 항상 6주를 유지하도록 추가
    while (weeks.length < 6) {
      const newWeek: { date: number; dateStr: string; isCurrentMonth: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        newWeek.push({
          date: nextDate,
          dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDate).padStart(2, '0')}`,
          isCurrentMonth: false,
        });
        nextDate++;
      }
      weeks.push(newWeek);
    }

    return weeks;
  }, [currentYear, currentMonth]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-28 box-border overflow-auto no-scrollbar">
      <NavigateClickWrapper method={'back'}>
        <button
          type="button"
          aria-label="뒤로가기"
          className={[
            'absolute left-3 z-10',
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            'backdrop-blur text-white shadow mt-10',
          ].join(' ')}
        >
          <LeftArrow className="h-5 w-5"/>
        </button>
      </NavigateClickWrapper>

      {/* 썸네일 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
        {(lessonGroup.thumbnailUrl || lessonGroup.artist?.profileImageUrl) ? (
          <Image
            src={lessonGroup.thumbnailUrl || lessonGroup.artist?.profileImageUrl || ''}
            alt={lessonGroup.title ?? 'thumbnail'}
            fill
            className="object-cover"
            quality={60}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* 디테일 영역 */}
      <div className="w-full py-5 flex-col justify-start items-start gap-4 inline-flex">
        <div className="self-stretch flex-col justify-start items-start gap-0 flex">
          {/* 수업명 */}
          <div className="self-stretch px-6 flex-col justify-start items-start gap-2.5 flex">
            <div className="self-stretch justify-between items-start inline-flex">
              {lessonGroup.studio && (
                <div className="flex items-center gap-2">
                  {lessonGroup.studio.profileImageUrl && (
                    <CircleImage size={32} imageUrl={lessonGroup.studio.profileImageUrl}/>
                  )}
                  <span className="text-[14px] text-gray-600">{lessonGroup.studio.name}</span>
                </div>
              )}
              <div className="justify-center items-start gap-[3px] flex">
                {lessonGroup.level && <LessonLevelLabel label={lessonGroup.level}/>}
                {lessonGroup.genre && lessonGroup.genre !== 'Default' && <LessonLabel label={lessonGroup.genre}/>}
              </div>
            </div>
            <div className="self-stretch justify-start items-center gap-2 inline-flex">
              <div className="w-full text-black text-xl font-bold leading-normal">{lessonGroup.title}</div>
            </div>

            {/* 정기수업 정보 */}
            <div className="w-full flex flex-col gap-1 mt-2">
              {lessonGroup.days && lessonGroup.days.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">수업 요일</span>
                  <span className="text-[13px] text-black font-medium">{formatDays(lessonGroup.days)}</span>
                </div>
              )}
              {lessonGroup.startTime && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">수업 시간</span>
                  <span className="text-[13px] text-black font-medium">{lessonGroup.startTime}</span>
                  {lessonGroup.duration && (
                    <span className="text-[13px] text-gray-400">({lessonGroup.duration}분)</span>
                  )}
                </div>
              )}
              {/* 연습실 정보 */}
              {lessonGroup.studioRoom && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">연습실</span>
                  <span className="text-[13px] text-black font-medium">{lessonGroup.studioRoom.name}</span>
                </div>
              )}
              {/* 수강 횟수 */}
              {lessonGroup.paymentCount && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">수강 횟수</span>
                  <span className="text-[13px] text-black font-medium">{lessonGroup.paymentCount}회</span>
                </div>
              )}
              {/* 수강 현황 */}
              {lessonGroup.limit && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">수강 현황</span>
                  <span className="text-[13px] text-black font-medium">{lessonGroup.currentStudentCount} / {lessonGroup.limit}명</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-3 bg-[#f7f8f9] mt-4"/>

          {/* 수업 일정 */}
          <div className="self-stretch py-4">
            {/* 헤더 + 월 네비게이션 */}
            <div className="flex items-center justify-between px-6 mb-4">
              <span className="text-[16px] font-bold text-black">수업 일정</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="w-8 h-8 rounded-full bg-[#f7f8f9] flex items-center justify-center active:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <span className="text-[14px] font-medium text-black min-w-[80px] text-center">
                  {currentYear}.{String(currentMonth).padStart(2, '0')}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="w-8 h-8 rounded-full bg-[#f7f8f9] flex items-center justify-center active:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 px-2">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-[11px] font-medium py-2 ${
                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="min-h-[360px] px-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-[360px]">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin"/>
                </div>
              ) : (
                <div className="flex flex-col">
                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                      {week.map((day, dayIndex) => {
                        const dayLessons = lessonsByDate[day.dateStr] || [];
                        const hasLesson = dayLessons.length > 0;
                        const isToday = day.dateStr === today;
                        const isPast = day.dateStr < today;
                        const isCompleted = dayLessons.every(l => l.status === LessonStatus.Completed);

                        return (
                          <div
                            key={day.dateStr}
                            onClick={() => hasLesson && day.isCurrentMonth && handleLessonClick(dayLessons[0].id)}
                            className={`flex flex-col items-center py-2 ${hasLesson && day.isCurrentMonth ? 'cursor-pointer active:bg-gray-50 rounded-lg' : ''}`}
                          >
                            <span className={`text-[13px] w-7 h-7 flex items-center justify-center rounded-full ${
                              !day.isCurrentMonth ? 'text-gray-200' :
                              isToday ? 'bg-black text-white font-bold' :
                              dayIndex === 0 ? 'text-red-400' :
                              dayIndex === 6 ? 'text-blue-400' : 'text-gray-800'
                            }`}>
                              {day.date}
                            </span>
                            {/* 수업 있는 날 표시 */}
                            {hasLesson && day.isCurrentMonth && (
                              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                                isCompleted || isPast ? 'bg-gray-300' : 'bg-black'
                              }`}/>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 다음 수업 정보 */}
            {nextLesson && (
              <div className="mx-4 mt-2 p-4 bg-black rounded-[16px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {nextLesson.artist?.profileImageUrl && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src={nextLesson.artist.profileImageUrl} alt="" fill className="object-cover"/>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400">다음 수업</span>
                      <span className="text-[15px] text-white font-bold">
                        {(() => {
                          const parts = nextLesson.startDate?.split(' ')[0].split('.');
                          const time = nextLesson.startDate ? parseStartTime(nextLesson.startDate) : '';
                          return parts ? `${parts[1]}월 ${parts[2]}일 ${time}` : '';
                        })()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>
              </div>
            )}
          </div>

          {/* 강사 정보 */}
          {lessonGroup.artist && (
            <>
              <div className="w-full h-3 bg-[#f7f8f9]"/>
              <div className="self-stretch px-6 py-4">
                <div className="text-black text-[16px] font-bold mb-3">{getLocaleString({locale, key: 'artist'})}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {lessonGroup.artist.profileImageUrl && (
                      <CircleImage size={48} imageUrl={lessonGroup.artist.profileImageUrl}/>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[14px] text-black font-medium">{lessonGroup.artist.nickName}</span>
                    </div>
                  </div>
                  {lessonGroup.artist.instagramAddress && (
                    <button
                      type="button"
                      aria-label="Instagram"
                      className="w-[32px] h-[32px] inline-flex items-center justify-center"
                      onClick={handleInstagramClick}
                    >
                      <InstagramIcon className="w-6 h-6"/>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 설명 */}
          {lessonGroup.description && (
            <>
              <div className="w-full h-3 bg-[#f7f8f9]"/>
              <div className="self-stretch px-6 py-4">
                <div className="text-black text-[16px] font-bold mb-3">{getLocaleString({locale, key: 'lesson_description'})}</div>
                <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lessonGroup.description}
                </div>
              </div>
            </>
          )}

          {/* 보유 수강권 정보 */}
          {lessonGroup.ticket && (
            <>
              <div className="w-full h-3 bg-[#f7f8f9]"/>
              <div className="self-stretch px-6 py-4">
                <div className="text-black text-[16px] font-bold mb-3">보유 수강권</div>
                <div className="bg-[#f7f8f9] rounded-[12px] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-gray-600">상태</span>
                    <span className="text-[14px] text-black font-medium">{lessonGroup.ticket.status}</span>
                  </div>
                  {lessonGroup.ticket.remainingCount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-gray-600">남은 횟수</span>
                      <span className="text-[14px] text-black font-medium">{lessonGroup.ticket.remainingCount}회</span>
                    </div>
                  )}
                  {lessonGroup.ticket.endDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-gray-600">이용 기간</span>
                      <span className="text-[14px] text-black font-medium">~{lessonGroup.ticket.endDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 수업 상세 다이얼로그 */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-[16px] w-[90%] max-w-[360px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isDialogLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
              </div>
            ) : selectedLesson ? (
              <div className="flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] px-2 py-0.5 rounded text-white ${getStatusColor(selectedLesson.status)}`}>
                      {selectedLesson.status}
                    </span>
                  </div>
                  <button onClick={closeDialog} className="p-1">
                    <CloseIcon className="w-5 h-5"/>
                  </button>
                </div>

                {/* 썸네일 */}
                {selectedLesson.thumbnailUrl && (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={selectedLesson.thumbnailUrl}
                      alt={selectedLesson.title || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* 내용 */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-[18px] font-bold text-black">{selectedLesson.title}</h3>

                  {/* 날짜/시간 */}
                  {selectedLesson.formattedDate && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[14px] text-gray-600">
                        {selectedLesson.formattedDate.date} {selectedLesson.formattedDate.weekday}
                      </div>
                      <div className="text-[14px] text-black font-medium">
                        {selectedLesson.formattedDate.startTime} - {selectedLesson.formattedDate.endTime}
                      </div>
                    </div>
                  )}

                  {/* 강사 */}
                  {selectedLesson.artists && selectedLesson.artists.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {selectedLesson.artists[0].profileImageUrl && (
                        <CircleImage size={32} imageUrl={selectedLesson.artists[0].profileImageUrl}/>
                      )}
                      <span className="text-[14px] text-black">{selectedLesson.artists[0].nickName}</span>
                    </div>
                  )}

                  {/* 수강 현황 */}
                  {selectedLesson.currentStudentCount !== undefined && selectedLesson.limit && (
                    <div className="flex items-center gap-2 text-[14px]">
                      <span className="text-gray-500">수강 현황</span>
                      <span className="text-black font-medium">{selectedLesson.currentStudentCount} / {selectedLesson.limit}명</span>
                    </div>
                  )}

                  {/* 버튼 */}
                  {selectedLesson.status !== LessonStatus.Completed && selectedLesson.status !== LessonStatus.Cancelled && (
                    <button
                      onClick={() => {
                        closeDialog();
                        kloudNav.push(KloudScreen.LessonDetail(selectedLesson.id));
                      }}
                      className="mt-4 w-full py-3 bg-black text-white rounded-[12px] text-[14px] font-medium active:opacity-80"
                    >
                      상세 보기
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-400">
                수업 정보를 불러올 수 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="left-0 w-full h-fit fixed bottom-6 px-6 z-20">
        {availableButton ? (
          <button
            onClick={() => handleButtonClick(availableButton.route)}
            disabled={!availableButton.route}
            className={`flex justify-center font-bold items-center w-full h-14 rounded-lg active:scale-[0.95] transition-transform duration-150 select-none ${
              !availableButton.route ? "bg-[#bcbfc2]" : "bg-black text-white"
            }`}
          >
            {availableButton.title}
          </button>
        ) : (
          <button
            disabled
            className="flex justify-center font-bold items-center w-full h-14 rounded-lg bg-[#bcbfc2] select-none"
          >
            현재 결제가 불가능합니다
          </button>
        )}
      </div>
    </div>
  );
}
