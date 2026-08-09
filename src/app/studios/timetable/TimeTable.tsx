'use client';

import Image from 'next/image';
import { KloudScreen } from "@/shared/kloud.screen";
import React, { useState, useMemo, useEffect } from "react";
import { GetTimeTableResponse, GetTimeTableCellResponse, GetTimeTableLessonResponse } from "@/app/endpoint/studio.endpoint";
import { parseLessonWallClock } from "@/utils/lesson.relative.date";
// 주간 네비 chevron — 얇고 깔끔한 인라인 아이콘
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
    <path d="M14.5 6.5l-5 5.5 5 5.5" stroke="#3C4149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
    <path d="M9.5 6.5l5 5.5-5 5.5" stroke="#3C4149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 빈 주 상태 — 달력 아이콘 + 친근한 문구
const EmptyWeek = ({ title, sub }: { title: string; sub: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-full bg-[#EFF1F4] flex items-center justify-center mb-3">
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect x="3" y="4.5" width="18" height="16" rx="3" stroke="#AEB4BB" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="#AEB4BB" strokeWidth="1.6" />
        <path d="M8 2.5v4M16 2.5v4" stroke="#AEB4BB" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.5 14.5l5 3M14.5 14.5l-5 3" stroke="#C7CDD3" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
    <p className="text-[15px] font-bold text-[#4E5968]">{title}</p>
    <p className="mt-1 text-[13px] text-[#A0A5AB]">{sub}</p>
  </div>
);
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { AnalyticsEvent, trackEvent } from "@/app/lib/analytics";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";
import { getRelativeWeekPrefix } from "@/utils/lesson.relative.date";

// 해당 날짜가 속한 주의 월요일 구하기
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 날짜를 yyyy-MM-dd 형식으로 포맷 (로컬 타임존)
const formatDateLocal = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// baseDate 기준 주의 월~일 날짜 배열 생성
const getWeekDays = (baseDate: Date, today: string): { day: string; date: string; isToday: boolean }[] => {
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monday = getMonday(baseDate);

  // 서버에서 ISO 형식(2025-01-16T00:00:00)으로 올 수 있으므로 정규화
  const normalizedToday = today.includes('T') ? today.split('T')[0] : today;

  return dayNames.map((dayName, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = formatDateLocal(date);
    return {
      day: dayName,
      date: dateStr,
      isToday: dateStr === normalizedToday,
    };
  });
};

// 월 몇째 주 라벨 (예: "7월 넷째 주") — 상대 라벨(±1주) 범위 밖의 폴백.
const getMonthWeekTitle = (baseDate: Date, locale: Locale): string => {
  const monday = getMonday(baseDate);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);

  const month = thursday.getMonth();
  const year = thursday.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const diffFirstThursday = (4 - firstDayOfWeek + 7) % 7;
  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + diffFirstThursday);

  const diffInDays = Math.floor((thursday.getTime() - firstThursday.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekNames = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];

  if (locale === 'ko') return `${month + 1}월 ${weekNames[weekIndex] ?? `${weekIndex + 1}번째`} 주`;
  if (locale === 'jp') return `${month + 1}月 第${weekIndex + 1}週`;
  if (locale === 'zh') return `${month + 1}月 第${weekIndex + 1}周`;
  return `Week ${weekIndex + 1} of ${monthNames[month]}`;
};

// 기준 주(baseDate)가 오늘 주(refDate) 대비 ±1주면 상대 라벨(이번/지난/다음 주),
// 그 밖(2주 이상)은 '월 몇째 주'로 폴백.
const getRelativeWeekTitle = (baseDate: Date, refDate: Date, locale: Locale): string => {
  const diff = Math.round((getMonday(baseDate).getTime() - getMonday(refDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const rel = {
    ko: { this: '이번 주 열리는 수업', next: '다음 주 열리는 수업', prev: '지난 주 열리는 수업' },
    en: { this: 'Classes this week', next: 'Classes next week', prev: 'Classes last week' },
    jp: { this: '今週開かれる授業', next: '来週開かれる授業', prev: '先週開かれた授業' },
    zh: { this: '本周开设的课程', next: '下周开设的课程', prev: '上周开设的课程' },
  }[locale];
  if (diff === 0) return rel.this;
  if (diff === 1) return rel.next;
  if (diff === -1) return rel.prev;
  return getMonthWeekTitle(baseDate, locale);
};


// 수업 셀에 표기할 'HH:mm' — lesson.startDate(KST)를 TZ 변환 없이 리터럴 파싱해서 쓴다.
// startDate가 없으면(구 응답) undefined를 반환해 호출부가 TIME 컬럼 셀의 row→time 맵으로 폴백한다.
const lessonHhmm = (lesson?: GetTimeTableLessonResponse): string | undefined => {
  const d = parseLessonWallClock({ startDate: lesson?.startDate });
  if (!d) return undefined;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// 'HH:mm' → 'PM 1:00' (12시간제 + AM/PM). 파싱 실패 시 원본.
const formatAmPm = (t?: string): string => {
  if (!t) return '';
  const [hh, mm] = t.split(':').map(Number);
  if (Number.isNaN(hh)) return t;
  const ampm = hh < 12 ? 'AM' : 'PM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${ampm} ${h12}:${String(Number.isNaN(mm) ? 0 : mm).padStart(2, '0')}`;
};

export const TimeTable = ({timeTable, studioId, locale, useSheet = false, clickEvent}: {
  timeTable: GetTimeTableResponse,
  studioId: number,
  locale: Locale,
  /** true면 수업 셀 탭 시 상세 이동 대신 스튜디오 바텀시트 오픈 이벤트를 발생시킨다. */
  useSheet?: boolean,
  /**
   * 셀 탭 시 보낼 분석 이벤트. 시간표는 홈·스튜디오 상세에서 함께 쓰는데 홈 클릭만 세고 싶어
   * 호출부가 지정할 때만 보낸다.
   */
  clickEvent?: AnalyticsEvent,
}) => {
  // 셀 탭 동작 — 렌더 타입(A/B/C) 3곳이 같은 흐름이라 여기로 모은다. 분석 이벤트도 여기 한 곳에서만 나간다.
  const openLesson = (lessonId: number) => {
    if (clickEvent) trackEvent(clickEvent, { lessonId, studioId });
    if (useSheet) {
      window.dispatchEvent(new CustomEvent(`studio-${studioId}-open-lesson-sheet`, { detail: { lessonId } }));
    } else {
      kloudNav.push(KloudScreen.LessonDetail(lessonId));
    }
  };

  const [baseDate, setBaseDate] = useState<Date>(new Date(timeTable.baseDate));
  const [cells, setCells] = useState<GetTimeTableCellResponse[]>(timeTable.cells);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // 클라이언트에서 오늘 날짜 직접 계산 (useEffect로 hydration mismatch 방지)
  const [clientToday, setClientToday] = useState<string>('');
  useEffect(() => {
    setClientToday(formatDateLocal(new Date()));
  }, []);

  // 클라이언트에서 계산되는 날짜 관련 데이터
  const days = useMemo(() => getWeekDays(baseDate, clientToday), [baseDate, clientToday]);
  const title = useMemo(() => {
    const ref = clientToday ? new Date(clientToday) : new Date(timeTable.baseDate);
    return getRelativeWeekTitle(baseDate, ref, locale);
  }, [baseDate, clientToday, locale, timeTable.baseDate]);
  // 오늘 컬럼에 수업이 하나라도 있는지 — 오늘 컬럼 강조는 이 경우에만.
  // (allDays = [TIME, ...days]라 오늘 컬럼 값 = days 인덱스 + 1)
  const hasLessonToday = useMemo(() => {
    const todayIdx = days.findIndex((d) => d.isToday);
    if (todayIdx < 0) return false;
    return cells.some((c) => c.column === todayIdx + 1 && !!c.lesson);
  }, [days, cells]);
  // 그 주에 수업이 열리는 요일 — 제목 아래 description용.
  // (allDays = [TIME, ...days(월~일)]라 lesson 셀의 column 1~7 = 월~일)
  const lessonDaysText = useMemo(() => {
    const cols = new Set(cells.filter((c) => !!c.lesson).map((c) => c.column));
    const names: Record<Locale, string[]> = {
      ko: ['월', '화', '수', '목', '금', '토', '일'],
      en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      jp: ['月', '火', '水', '木', '金', '土', '日'],
      zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    };
    const pickedCols = [1, 2, 3, 4, 5, 6, 7].filter((col) => cols.has(col));
    if (pickedCols.length === 0) return '';
    // 7일 모두 수업이 있으면 '매일 …'로
    if (pickedCols.length === 7) {
      return { ko: '매일 수업이 열려요', en: 'Classes every day', jp: '毎日授業があります', zh: '每天开课' }[locale];
    }
    const joined = pickedCols.map((col) => names[locale][col - 1]).join('·');
    return { ko: `${joined} 수업이 열려요`, en: `Open ${joined}`, jp: `${joined}開講`, zh: `${joined}开课` }[locale];
  }, [cells, locale]);

  const maxRow = Math.max(...cells.map(cell => cell.row + (cell.length ?? 1) - 1), 0);

  // 그 주에 수업(레슨 셀)이 하나도 없는지 — 있으면 그리드, 없으면 빈 상태로 전체를 채운다.
  const noLesson = cells.every((c) => !c.lesson);
  // 빈 상태 문구 — 이번주/다음주/지난주에는 …
  const emptyWeekPrefix = getRelativeWeekPrefix(baseDate, clientToday ? new Date(clientToday) : new Date(timeTable.baseDate), locale);
  const emptyTitle = getLocaleString({ locale, key: 'no_week_lessons' }).replace('{week}', emptyWeekPrefix);
  const emptySub = getLocaleString({ locale, key: 'no_this_week_lessons_sub' });

  const fetchTimeTable = async (targetDate: Date) => {
    setIsLoading(true);
    setIsError(false);

    const newTable = await getTimeTableAction({
      baseDate: formatDateLocal(targetDate),
      studioId,
    });

    if ('cells' in newTable) {
      setCells(newTable.cells);
    } else {
      setIsError(true);
    }
    setIsLoading(false);
  };

  const onClickPrev = async () => {
    if (window && window.KloudEvent) {
      window.KloudEvent.sendHapticFeedback();
    }

    const prevBaseDate = new Date(baseDate);
    prevBaseDate.setDate(prevBaseDate.getDate() - 7);
    setBaseDate(prevBaseDate);
    await fetchTimeTable(prevBaseDate);
  };

  const onClickNext = async () => {
    if (window && window.KloudEvent) {
      window.KloudEvent.sendHapticFeedback();
    }

    const nextBaseDate = new Date(baseDate);
    nextBaseDate.setDate(nextBaseDate.getDate() + 7);
    setBaseDate(nextBaseDate);
    await fetchTimeTable(nextBaseDate);
  };

  const onRetry = () => {
    fetchTimeTable(baseDate);
  };

  // TIME 컬럼 + 요일 컬럼
  const allDays = [{ day: 'TIME', date: '', isToday: false }, ...days];

  // 시간표 렌더 타입 — 서버 응답(type) 기준. 안 내려오면 A.
  //  A = 시간축 그리드(구멍 있음) / B = 구멍 메운 그리드(요일별 위로 쌓기) / C = 요일별 리스트(시간+썸네일)
  const timeTableType = timeTable.type ?? 'A';

  return (
    <div className="flex flex-col px-1">

      {/* 섹션 헤더 — 좌측 주차 라벨(섹션 제목) + 우측 주간 이동 화살표 */}
      <div className="flex justify-between items-center gap-2 mt-6 mb-3 px-4 w-full">
        <div className="min-w-0">
          <h2 className="text-[20px] text-black font-bold leading-tight truncate">{title}</h2>
          {lessonDaysText && <p className="text-[12px] text-[#8B95A1] mt-0.5 truncate">{lessonDaysText}</p>}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onClickPrev}
            aria-label="이전 주"
            className="w-9 h-9 flex items-center justify-center active:opacity-40 transition-opacity duration-150"
          >
            <ChevronLeft/>
          </button>
          <button
            type="button"
            onClick={onClickNext}
            aria-label="다음 주"
            className="w-9 h-9 flex items-center justify-center active:opacity-40 transition-opacity duration-150"
          >
            <ChevronRight/>
          </button>
        </div>
      </div>
      {/* 본문 — A: 시간축 그리드 / B: 구멍 메운 그리드 / C: 요일별 리스트. 로딩/에러 오버레이 공유.
          옅은 회색 rounded 카드는 요일 헤더부터 감싼다(상단 주차 라벨/description 제외). */}
      <div className={`relative py-3 rounded-[20px] bg-[#FAFBFC] min-h-[360px] ${timeTableType === 'C' ? 'mx-3 px-1' : 'px-[2px]'}`}>
        {timeTableType === 'C' ? (
          /* ── C 타입 ── 왼쪽 시간 컬럼 없이, 요일별로 수업을 리스트로. 각 행: 시간(PM 1:00) + 썸네일 + 제목 */
          <div className="flex flex-col gap-5 px-4 pt-1">
            {(() => {
              const rowToTime: Record<number, string> = {};
              cells.forEach((c) => { if (c.time) rowToTime[c.row] = c.time; });
              const koDays = ['월', '화', '수', '목', '금', '토', '일'];
              const sections = days
                .map((d, i) => ({
                  d,
                  i,
                  dayLessons: cells
                    .filter((c) => !!c.lesson && c.column === i + 1)
                    .sort((a, b) => a.row - b.row),
                }))
                .filter((s) => s.dayLessons.length > 0);

              if (sections.length === 0) {
                return !isLoading && !isError ? <EmptyWeek title={emptyTitle} sub={emptySub} /> : null;
              }

              return sections.map(({ d, i, dayLessons }) => (
                <div key={d.date}>
                  <div className="flex items-baseline gap-1.5 mb-2.5">
                    <span className={`text-[15px] font-bold ${d.isToday ? 'text-[#2AA894]' : 'text-black'}`}>{koDays[i]}</span>
                    <span className="text-[12px] text-[#9AA0A6]">{d.date.split('-').slice(1).join('.')}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {dayLessons.map((cell) => (
                      <div
                        key={`${cell.row}-${cell.column}`}
                        onClick={() => openLesson(cell.lesson!.id)}
                        className="flex items-center gap-3 active:opacity-70 transition-opacity cursor-pointer"
                      >
                        <span className="w-[62px] shrink-0 text-[12px] font-bold text-[#4E5968] font-paperlogy">
                          {formatAmPm(lessonHhmm(cell.lesson) ?? rowToTime[cell.row])}
                        </span>
                        <div className="w-[52px] h-[52px] rounded-[10px] overflow-hidden bg-[#F1F3F6] shrink-0">
                          {cell.lesson!.thumbnailUrl && (
                            <Image src={cell.lesson!.thumbnailUrl} alt="" width={52} height={52} className="w-full h-full object-cover" quality={10} sizes="60px" />
                          )}
                        </div>
                        <span className="flex-1 min-w-0 text-[14px] font-medium text-[#171717] line-clamp-2">{cell.lesson!.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : timeTableType === 'B' ? (
          /* ── B 타입 ── 그리드 유지, 각 요일 컬럼의 빈 구멍(시간 갭) 없이 위에서부터 빈틈없이 쌓음 (TIME 컬럼 없음) */
          (() => {
            const lessonsByDay = days.map((_, j) =>
              cells.filter((c) => !!c.lesson && c.column === j + 1).sort((a, b) => a.row - b.row));
            const maxPerDay = Math.max(...lessonsByDay.map((l) => l.length), 0);
            // row → 진행 시간 (TIME 컬럼 셀에서). 각 수업 셀에 시간 라벨로 표기.
            const rowToTime: Record<number, string> = {};
            cells.forEach((c) => { if (c.time) rowToTime[c.row] = c.time; });
            return (
              <div
                className="grid w-full text-center text-[14px] font-medium text-black"
                style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `auto repeat(${maxPerDay}, minmax(0, 1fr))`,
                  gap: '4px',
                }}
              >
                {/* 요일 헤더 */}
                {days.map((value, j) => (
                  <div
                    key={value.day + j}
                    className={`text-center flex flex-col items-center rounded-lg ${value.isToday ? 'bg-black' : ''}`}
                    style={{ gridColumnStart: j + 1, gridRowStart: 1, paddingTop: '0.35rem', paddingBottom: '0.35rem' }}
                  >
                    <div className={`text-[11px] font-sans ${value.isToday ? 'text-white font-bold' : 'text-[#7A7A7A]'}`}>{value.day}</div>
                    {value.date && value.date.length > 1 && (
                      <div className={`text-[17px] leading-none font-paperlogy mt-[3px] ${value.isToday ? 'text-white font-bold' : 'text-[#BCBCBC]'}`}>
                        {value.date.split('-')[2]}
                      </div>
                    )}
                  </div>
                ))}
                {/* 구멍 메운 수업 — 요일 컬럼별로 위에서부터 연속 배치 */}
                {lessonsByDay.map((list, j) => list.map((cell, k) => {
                  const timeLabel = formatAmPm(lessonHhmm(cell.lesson) ?? rowToTime[cell.row]);
                  return (
                  <div
                    key={`${cell.row}-${cell.column}`}
                    onClick={() => openLesson(cell.lesson!.id)}
                    className="overflow-hidden rounded-[8px] border shadow-sm active:scale-[0.97] transition-all duration-150 aspect-[1/1.76] cursor-pointer"
                    style={{ gridColumnStart: j + 1, gridRowStart: k + 2, zIndex: 1 }}
                  >
                    <div className="relative w-full h-full flex flex-col">
                      {cell.lesson!.thumbnailUrl ? (
                        <div className="flex-1 relative w-full min-h-0">
                          <Image src={cell.lesson!.thumbnailUrl} alt="lesson thumbnail" fill className="object-cover" quality={10} sizes="96px" />
                        </div>
                      ) : (
                        <div className="flex-1 w-full bg-gray-200" />
                      )}
                      {/* 썸네일 위 진행 시간 배지 */}
                      {timeLabel && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded-[4px] bg-black/60 backdrop-blur-sm text-white text-[6.5px] font-bold font-paperlogy leading-none">
                          {timeLabel}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-center text-[8px] font-paperlogy pb-2 pt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {cell.lesson!.title}
                      </div>
                    </div>
                  </div>
                  );
                }))}
                {/* 빈 주 */}
                {maxPerDay === 0 && !isLoading && !isError && (
                  <div className="col-span-full" style={{ gridRowStart: 2, gridColumnStart: 1 }}>
                    <EmptyWeek title={emptyTitle} sub={emptySub} />
                  </div>
                )}
              </div>
            );
          })()
        ) : (
        <div
          className="grid w-full text-center text-[14px] font-medium text-black"
          style={{
            gridTemplateColumns: `repeat(${allDays.length}, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(${maxRow}, minmax(0, 1fr))`,
            gap: '4px'
          }}
        >
        {/* 수업 영역 배경 — 로딩 중에도 유지(셀 언마운트 방지) */}
        {!noLesson && (
          <div
            className="bg-[#F7F8F9] rounded-[10px]"
            style={{
              gridColumnStart: 2,
              gridColumnEnd: allDays.length + 1,
              gridRowStart: 2,
              gridRowEnd: maxRow + 3,
              zIndex: 0,
            }}
          />
        )}

        {/* 오늘 컬럼 강조 — 세로 하이라이트 스트립 (셀은 위에 얹힘). 오늘 수업 있을 때만 */}
        {(() => {
          const todayIdx = days.findIndex((d) => d.isToday);
          if (todayIdx < 0 || !hasLessonToday) return null;
          return (
            <div
              className="bg-[#EAF1FF] rounded-[10px] pointer-events-none"
              style={{
                gridColumnStart: todayIdx + 2,
                gridColumnEnd: todayIdx + 3,
                gridRowStart: 2,
                gridRowEnd: maxRow + 3,
                zIndex: 0,
              }}
            />
          );
        })()}
        {allDays.map((value, i) => (
          <div
            key={value.day + i}
            className={`text-center flex flex-col items-center rounded-lg ${value.isToday ? 'bg-black' : ''}`}
            style={{
              gridColumnStart: i + 1,
              gridRowStart: 1,
              paddingTop: '0.35rem',
              paddingBottom: '0.35rem',
              height: '100%',
            }}
          >
            {value.day != 'TIME' &&
              <div
                className={`text-[11px] font-sans ${value.isToday ? 'text-white font-bold' : 'text-[#7A7A7A]'}`}
              >
                {value.day}
              </div>
            }
            {value.date && value.date.length > 1 && (
              <div
                className={`text-[17px] leading-none font-paperlogy mt-[3px] ${value.isToday ? 'text-white font-bold' : 'text-[#BCBCBC]'}`}
              >
                {value.date.split('-')[2]}
              </div>
            )}
          </div>
        ))}
        {/* timetable cell — 로딩/에러는 아래에서 오버레이로 처리하고, 셀은 계속 마운트 유지 */}
        {!noLesson ? (
          (() => {
            const timeCells = cells.filter(c => !!c.time);
            const firstTimeRow = timeCells.length > 0 ? Math.min(...timeCells.map(c => c.row)) : -1;
            const lastTimeRow = timeCells.length > 0 ? Math.max(...timeCells.map(c => c.row + (c.length ?? 1) - 1)) : -1;

            return cells.map((item) => {
              const isTime = !!item.time;
              const isLesson = !!item.lesson;
              const isFirstTime = isTime && item.row === firstTimeRow;
              const isLastTime = isTime && (item.row + (item.length ?? 1) - 1) === lastTimeRow;

              // 인덱스 대신 grid 위치(row-column)로 키잉 — 주차 이동으로 cells가 통째로 교체돼도
              // 같은 칸의 <Image> DOM이 유지돼 이미지가 다시 디코드/깜빡이지 않음
              return (
                <div
                  key={`${item.row}-${item.column}`}
                  onClick={() => {
                    if (!isLesson) return;
                    openLesson(item.lesson!.id);
                  }}
                  className={`overflow-hidden transition-all duration-150
                    ${isLesson ? 'rounded-[8px] border shadow-sm hover:shadow-md aspect-[1/1.76] active:scale-[0.97] cursor-pointer' : ''}
                    ${isTime ? 'bg-[#181818] text-white flex items-center justify-center font-paperlogy' : ''}
                    ${isFirstTime && isLastTime ? 'rounded-[10px]' : ''}
                    ${isFirstTime && !isLastTime ? 'rounded-t-[10px]' : ''}
                    ${isLastTime && !isFirstTime ? 'rounded-b-[10px]' : ''}
                  `}
                  style={{
                    gridColumnStart: item.column + 1,
                    gridRowStart: item.row + 2,
                    gridRowEnd: `span ${item.length ?? 1}`,
                    minHeight: isTime ? 0 : undefined,
                    zIndex: 1,
                  }}
                >
                  {isLesson && (
                    <div className="relative w-full h-full flex flex-col">
                      {item.lesson!.thumbnailUrl ? (
                        <div className="flex-1 relative w-full min-h-0">
                          <Image
                            src={item.lesson!.thumbnailUrl}
                            alt="lesson thumbnail"
                            fill
                            className="object-cover"
                            quality={10}
                            sizes="96px"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 w-full bg-gray-200" />
                      )}
                      <div
                        className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-center text-[8px] font-paperlogy pb-2 pt-1
                 overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {item.lesson!.title}
                      </div>
                    </div>
                  )}
                  {isTime && (
                    <span className={'text-[10px]'}>{item.time}</span>
                  )}
                </div>
              );
            });
          })()
        ) : (!isLoading && !isError) ? (
          <div className="col-span-full" style={{ gridRowStart: 2, gridColumnStart: 1 }}>
            <EmptyWeek title={emptyTitle} sub={emptySub} />
          </div>
        ) : null}
        </div>
        )}

        {/* 로딩 오버레이 — 기존 셀 위에 덮어 깜빡임 없이 주차 전환 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60" style={{ zIndex: 2 }}>
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {/* 에러 오버레이 */}
        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white" style={{ zIndex: 2 }}>
            <div className="text-[14px] text-[#7A7A7A]">시간표를 불러오지 못했습니다</div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-black text-white text-[14px] rounded-[8px] active:scale-[0.97] transition-transform"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
