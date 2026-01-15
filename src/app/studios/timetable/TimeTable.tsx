'use client';

import Image from 'next/image';
import { KloudScreen } from "@/shared/kloud.screen";
import React, { useState, useMemo } from "react";
import { GetTimeTableResponse, GetTimeTableCellResponse } from "@/app/endpoint/studio.endpoint";
import BackwardIcon from "../../../../public/assets/ic_simple_left_arrow.svg"
import ForwardIcon from "../../../../public/assets/ic_simple_right_arrow.svg"
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";

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

// 주차 타이틀 계산 (예: "1월 첫째 주")
const getWeekTitle = (baseDate: Date, locale: Locale): string => {
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

  if (locale === 'ko') {
    return `${month + 1}월 ${weekNames[weekIndex] ?? `${weekIndex + 1}번째`} 주`;
  } else {
    return `Week ${weekIndex + 1} of ${monthNames[month]}`;
  }
};

// 주차 설명 계산 (예: "2025 01.06 ~ 01.12")
const getWeekDescription = (baseDate: Date): string => {
  const monday = getMonday(baseDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}`;
  };

  return `${monday.getFullYear()} ${formatDate(monday)} ~ ${formatDate(sunday)}`;
};

export const TimeTable = ({timeTable, locale}: {
  timeTable: GetTimeTableResponse,
  locale: Locale
}) => {
  const [baseDate, setBaseDate] = useState<Date>(new Date(timeTable.baseDate));
  const [cells, setCells] = useState<GetTimeTableCellResponse[]>(timeTable.cells);
  const [isLoading, setIsLoading] = useState(false);

  // 클라이언트에서 오늘 날짜 직접 계산
  const clientToday = useMemo(() => formatDateLocal(new Date()), []);

  // 클라이언트에서 계산되는 날짜 관련 데이터
  const days = useMemo(() => getWeekDays(baseDate, clientToday), [baseDate, clientToday]);
  const title = useMemo(() => getWeekTitle(baseDate, locale), [baseDate, locale]);
  const description = useMemo(() => getWeekDescription(baseDate), [baseDate]);

  const maxRow = Math.max(...cells.map(cell => cell.row + (cell.length ?? 1) - 1), 0);

  const onClickPrev = async () => {
    if (window && window.KloudEvent) {
      window.KloudEvent.sendHapticFeedback();
    }

    const prevBaseDate = new Date(baseDate);
    prevBaseDate.setDate(prevBaseDate.getDate() - 7);

    // 날짜 먼저 업데이트 (즉시 반영)
    setBaseDate(prevBaseDate);
    setIsLoading(true);

    const newTable = await getTimeTableAction({
      baseDate: formatDateLocal(prevBaseDate),
      studioId: timeTable.studioId,
    });

    if ('cells' in newTable) {
      setCells(newTable.cells);
    }
    setIsLoading(false);
  }

  const onClickNext = async () => {
    if (window && window.KloudEvent) {
      window.KloudEvent.sendHapticFeedback();
    }

    const nextBaseDate = new Date(baseDate);
    nextBaseDate.setDate(nextBaseDate.getDate() + 7);

    // 날짜 먼저 업데이트 (즉시 반영)
    setBaseDate(nextBaseDate);
    setIsLoading(true);

    const newTable = await getTimeTableAction({
      baseDate: formatDateLocal(nextBaseDate),
      studioId: timeTable.studioId,
    });

    if ('cells' in newTable) {
      setCells(newTable.cells);
    }
    setIsLoading(false);
  }

  // TIME 컬럼 + 요일 컬럼
  const allDays = [{ day: 'TIME', date: '', isToday: false }, ...days];

  return (
    <div className="flex flex-col px-1">

      <div className="flex py-3 px-4 ">
        <div className="text-[20px] font-bold text-black">{getLocaleString({locale, key: 'timetable_title'})}</div>
      </div>

      <div className="flex flex-row items-center justify-center gap-1 px-4 w-full pb-2">
        <div
          onClick={onClickPrev}
          className="relative flex items-center justify-center p-2 rounded-full active:bg-black/10 transition-colors duration-150 cursor-pointer"
        >
          <BackwardIcon/>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-[16px] text-black font-bold">{title}</h2>
          <p className="text-[12px] text-[#7A7A7A]">{description}</p>
        </div>

        <div
          onClick={onClickNext}
          className="relative flex items-center justify-center p-2 rounded-full active:bg-black/10 transition-colors duration-150 cursor-pointer"
        >
          <ForwardIcon/>
        </div>
      </div>
      <div
        className="relative grid w-full px-1 text-center text-[14px] font-medium text-black"
        style={{
          gridTemplateColumns: `repeat(${allDays.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${maxRow}, minmax(0, 1fr))`,
          gap: '4px'
        }}
      >
        {/* 수업 영역 배경 */}
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
        {allDays.map((value, i) => (
          <div
            key={value.day + i}
            className={`text-center flex flex-col items-center justify`}
            style={{
              gridColumnStart: i + 1,
              gridRowStart: 1,
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              height: '100%',
            }}
          >
            {value.day != 'TIME' &&
              <div
                className={`text-[12px] text-[#7A7A7A] font-sans`}
              >
                {value.day}
              </div>
            }
            {value.date && value.date.length > 1 && (
              <div
                className={`
      text-[14px] leading-none font-paperlogy mt-[6px] mb-[2px]
      w-6 h-6 flex items-center justify-center mx-auto p-4
      ${value.isToday ? 'bg-black text-white rounded-full' : 'text-[#BCBCBC]'}
    `}
              >
                {value.date.split('-')[2]}
              </div>
            )}
          </div>
        ))}
        {/* timetable cell */}
        {isLoading ? (
          <div
            className="col-span-full mt-4 flex items-center justify-center"
            style={{gridRowStart: 2, gridColumnStart: 1}}
          >
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : cells.length > 0 ? (
          (() => {
            const timeCells = cells.filter(c => c.type === 'time');
            const firstTimeRow = timeCells.length > 0 ? Math.min(...timeCells.map(c => c.row)) : -1;
            const lastTimeRow = timeCells.length > 0 ? Math.max(...timeCells.map(c => c.row + (c.length ?? 1) - 1)) : -1;

            return cells.map((item, i) => {
              const isFirstTime = item.type === 'time' && item.row === firstTimeRow;
              const isLastTime = item.type === 'time' && (item.row + (item.length ?? 1) - 1) === lastTimeRow;

              return (
                <div
                  key={i}
                  onClick={() =>
                    item.type === 'lesson' &&
                    kloudNav.push(KloudScreen.LessonDetail(item.lesson.id))
                  }
                  className={`overflow-hidden transition-all duration-150
                    ${item.type === 'lesson' ? 'rounded-[8px] border shadow-sm hover:shadow-md aspect-[1/1.76] active:scale-[0.97] cursor-pointer' : ''}
                    ${item.type === 'time' ? 'bg-[#181818] text-white flex items-center justify-center font-paperlogy' : ''}
                    ${isFirstTime && isLastTime ? 'rounded-[10px]' : ''}
                    ${isFirstTime && !isLastTime ? 'rounded-t-[10px]' : ''}
                    ${isLastTime && !isFirstTime ? 'rounded-b-[10px]' : ''}
                  `}
                  style={{
                    gridColumnStart: item.column + 1,
                    gridRowStart: item.row + 2,
                    gridRowEnd: `span ${item.length ?? 1}`,
                    minHeight: item.type === 'time' ? 0 : undefined,
                    zIndex: 1,
                  }}
                >
                  {item.type === 'lesson' && (
                    <div className="relative w-full h-full flex flex-col">
                      <div className="flex-1 relative w-full min-h-0">
                        <Image
                          src={item.lesson.thumbnailUrl}
                          alt="lesson thumbnail"
                          fill
                          className="object-cover"
                          quality={50}
                        />
                      </div>
                      <div
                        className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-center text-[8px] font-paperlogy pb-2 pt-1
                 overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {item.lesson.title}
                      </div>
                    </div>
                  )}
                  {item.type === 'time' && (
                    <span className={'text-[10px]'}>{item.time}</span>
                  )}
                </div>
              );
            });
          })()
        ) : (
          <div
            className="col-span-full mt-4"
            style={{gridRowStart: 2, gridColumnStart: 1}}
          >
            <div>{getLocaleString({locale, key: 'no_this_week_lessons'})}</div>
          </div>
        )}
      </div>
    </div>
  );
};
