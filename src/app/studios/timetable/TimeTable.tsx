'use client';

import Image from 'next/image';
import { KloudScreen } from "@/shared/kloud.screen";
import React, { useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";
import { GetTimeTableResponse } from "@/app/endpoint/studio.endpoint";
import BackwardIcon from "../../../../public/assets/ic_simple_left_arrow.svg"
import ForwardIcon from "../../../../public/assets/ic_simple_right_arrow.svg"
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";

export const TimeTable = ({timeTable, today}: { timeTable: GetTimeTableResponse, today: string }) => {
  const [currentTimeTable, setCurrentTimeTable] = useState<GetTimeTableResponse>(timeTable)
  const maxRow = Math.max(...currentTimeTable.cells.map(cell => cell.row + (cell.length ?? 1) - 1), 0);

  const onClickPrev = async () => {
    window.KloudEvent.sendHapticFeedback()
    const newTable = await getTimeTableAction({
      baseDate: currentTimeTable.prevDate ?? '',
      studioId: currentTimeTable.studioId,
    })
    if ('days' in newTable && newTable.days.length > 1) {
      setCurrentTimeTable(newTable);
    }
  }

  const onClickNext = async () => {
    window.KloudEvent.sendHapticFeedback()
    const newTable = await getTimeTableAction({
      baseDate: currentTimeTable.nextDate ?? '',
      studioId: currentTimeTable.studioId,
    })
    if ('days' in newTable && newTable.days.length > 1) {
      setCurrentTimeTable(newTable);
    }
  }

  return (
    <div className="flex flex-col px-1">
      <div className="flex flex-row items-center px-4 w-full justify-between">
        {currentTimeTable.prevDate ? (
          <div
            onClick={onClickPrev}
            className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 active:bg-gray-200"
          >
            <span
              className="absolute inset-0 scale-0 rounded-full bg-black opacity-10 group-active:scale-150 transition-transform duration-300 ease-out"></span>
            <BackwardIcon/>
          </div>
        ) : (
          <div className="w-[40px]"/> // placeholder to keep center aligned
        )}

        <div className="flex flex-col items-center justify-center text-center flex-grow">
          <h2 className="text-[20px] text-black font-bold">{currentTimeTable.title}</h2>
          <div className="mb-2 text-gray-700 text-[12px] font-paperlogy">{currentTimeTable.description}</div>
        </div>

        {currentTimeTable.nextDate ? (
          <div
            onClick={onClickNext}
            className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-full transition-all duration-200 active:bg-gray-200"
          >
            <span
              className="absolute inset-0 scale-0 rounded-full bg-black opacity-10 group-active:scale-150 transition-transform duration-300 ease-out"></span>
            <ForwardIcon/>
          </div>
        ) : (
          <div className="w-[40px]"/>
        )}
      </div>
      <div
        className="grid w-full px-1 text-center text-[14px] font-medium text-black"
        style={{
          gridTemplateColumns: `repeat(${currentTimeTable.days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${maxRow}, minmax(0, 1fr))`,
          gap: '4px'
        }}
      >
        {currentTimeTable.days.map((value, i) => (
          <div
            key={value.day}
            className={`rounded-lg font-paperlogy text-center flex flex-col items-center justify-${
              value.date ? 'start' : 'center'
            } ${
              value.isToday ? 'bg-black text-white' : 'bg-gray-300 text-black'
            }`}
            style={{
              gridColumnStart: i + 1,
              gridRowStart: 1,
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              height: '100%',
            }}
          >
            {value.date && value.date.length > 1 && (
              <div className="text-[10px] leading-none mb-[2px] text-gray-500">
                {value.date.split('-')[2]}
              </div>
            )}
            <div
              className={`text-[12px] leading-tight ${
                value.day === 'SAT' ? 'text-blue-500' :
                  value.day === 'SUN' ? 'text-red-500' : ''
              }`}
            >
              {value.day}
            </div>
          </div>
        ))}
        {/* timetable cell */}
        {currentTimeTable.cells.length > 0 ? (
          currentTimeTable.cells.map((item, i) => (
            <div
              key={i}
              onClick={() =>
                item.type === 'lesson' &&
                window.KloudEvent.push(KloudScreen.LessonDetail(item.lesson.id))
              }
              className={`rounded-[8px] border overflow-hidden shadow-sm hover:shadow-md transition-all duration-150
                ${item.type === 'lesson' ? 'aspect-[1/1.5] active:scale-[0.97] cursor-pointer' : ''}
                ${item.type === 'time' ? 'bg-black text-white flex items-center justify-center font-paperlogy' : ''}
              `}
              style={{
                gridColumnStart: item.column + 1,
                gridRowStart: item.row + 2, // +2: 1은 헤더, 2부터 timetable
                gridRowEnd: `span ${item.length ?? 1}`,
                minHeight: item.type === 'time' ? 0 : undefined,
              }}
            >
              {item.type === 'lesson' && (
                <div className="relative w-full h-full flex flex-col">
                  <div className="flex-1 relative w-full min-h-0">
                    <Image
                      src={
                        item.lesson.thumbnailUrl ??
                        item.lesson.artist?.profileImageUrl ??
                        ''
                      }
                      alt="lesson thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-center text-[8px] font-paperlogy pb-2 pt-1"
                  >
                    {item.lesson?.artist?.nickName ?? item.lesson.title}
                  </div>
                </div>
              )}
              {item.type === 'time' && (
                <span className={'text-[12px]'}>{item.time}</span>
              )}
            </div>
          ))
        ) : (
          <div
            className="col-span-full mt-4"
            style={{gridRowStart: 2, gridColumnStart: 1}}
          >
            <TranslatableText titleResource={'no_this_week_lessons'}/>
          </div>
        )}
      </div>
    </div>
  );
};