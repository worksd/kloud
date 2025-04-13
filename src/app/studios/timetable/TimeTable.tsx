'use client';

import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import Image from 'next/image';
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { TranslatableText } from "@/utils/TranslatableText";

export type TimeTableLesson = {
  row: number;
  column: number;
  lesson: GetLessonResponse;
};

export const TimeTable = ({lessons, todayIndex}: { lessons: GetLessonResponse[], todayIndex: number }) => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', "SUN"];
  const sortedLessons = sortLessons({lessons});

  return (
    <div>
      <h2 className="text-[20px] text-black font-medium mb-4 px-4">THIS WEEK</h2>
      <div className="w-full space-y-2 py-1">
        <div className="grid w-full grid-cols-7 px-1 text-center text-[14px] font-medium text-black space-x-0.5">
          {days.map((day, i) => (
            <div
              key={day}
              className={`py-2 rounded-lg ${
                i === todayIndex
                  ? 'bg-black text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        {lessons.length > 0 ?
          <div
            className="grid w-full gap-0.5 px-1"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            {sortedLessons.map((item, i) => (
              <div
                onClick={() => window.KloudEvent.push(KloudScreen.LessonDetail(item.lesson.id))}
                key={i}
                className="rounded-[8px] border border-black flex flex-col items-center text-white aspect-[1/1.5] overflow-hidden pt-1 active:scale-[0.98] transition-transform duration-150"
                style={{
                  gridColumnStart: item.column + 1,
                  gridRowStart: item.row + 1,
                }}
              >
                {item.lesson.startTime && item.lesson.duration && (
                  <div className="text-black text-[8px] font-bold ml-0.5">
                    {formatTimeRange(item.lesson.startTime, item.lesson.duration)}
                  </div>
                )}
                <div className="relative w-full flex-1 min-h-0">
                  <Image
                    src={item.lesson.thumbnailUrl ?? item.lesson.artist?.profileImageUrl ?? ''}
                    alt="profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div> : <div>
            <TranslatableText titleResource={'no_this_week_lessons'}/>
          </div>
        }
      </div>
    </div>
  );
};

function formatTimeRange(startTime: string, duration: number): string {
  try {
    const [dateStr, timeStr] = startTime.split(' ');
    const [year, month, day] = dateStr.split('.').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const format = (date: Date) =>
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0');

    return `${format(startDate)}-${format(endDate)}`;
  } catch {
    return '';
  }
}

function sortLessons({lessons}: { lessons: GetLessonResponse[] }): TimeTableLesson[] {
  const getDayColumn = (date: Date) => {
    const jsDay = date.getDay(); // 0 (Sun) ~ 6 (Sat)
    return (jsDay + 6) % 7; // 0 (Mon) ~ 6 (Sun)
  };

  const parseLessonDate = (lesson: GetLessonResponse) => {
    if (!lesson.startTime) return null;

    const date = new Date(
      lesson.startTime.replace(/(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:00'),
    );

    return {lesson, date};
  };

  const validLessons = lessons
    .map(parseLessonDate)
    .filter((x): x is { lesson: GetLessonResponse; date: Date } => x !== null);

  // 요일별 column bucket 생성
  const columnBuckets = Array.from({length: 7}, () => [] as { date: Date; lesson: GetLessonResponse }[]);

  // 요일별로 분류
  for (const item of validLessons) {
    const column = getDayColumn(item.date);
    columnBuckets[column].push(item);
  }

  // 각 column 안에서 정렬 + row 부여
  const result: TimeTableLesson[] = [];

  columnBuckets.forEach((bucket, column) => {
    bucket
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach((item, row) => {
        result.push({
          row,
          column,
          lesson: item.lesson,
        });
      });
  });

  return result;
}
