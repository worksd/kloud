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
    window.KloudEvent.sendHapticFeedback();

    const prevBaseDate = new Date(currentTimeTable.baseDate);
    prevBaseDate.setDate(prevBaseDate.getDate() - 7);

    const newTable = await getTimeTableAction({
      baseDate: prevBaseDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
      studioId: currentTimeTable.studioId,
    });

    if ('days' in newTable && newTable.days.length > 1) {
      setCurrentTimeTable(newTable);
    }
  }

  const onClickNext = async () => {
    window.KloudEvent.sendHapticFeedback()
    const nextBaseDate = new Date(currentTimeTable.baseDate);
    nextBaseDate.setDate(nextBaseDate.getDate() + 7);
    const newTable = await getTimeTableAction({
      baseDate: nextBaseDate.toISOString(), // 또는 원하는 포맷으로
      studioId: currentTimeTable.studioId,
    });
    if ('days' in newTable && newTable.days.length > 1) {
      setCurrentTimeTable(newTable);
    }
  }

  return (
    <div className="flex flex-col px-1">
      <div className="flex flex-row items-center justify-center gap-3 px-4 w-full pb-2">

        <div
          onClick={onClickPrev}
          className="relative flex items-center justify-center p-2 rounded-full active:bg-black/10 transition-colors duration-150 cursor-pointer"
        >
          <BackwardIcon/>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-[16px] text-black font-bold">{currentTimeTable.title}</h2>
          <div className={'text-[#BCBCBC] text-[10px] font-paperlogy'}>{currentTimeTable.description}</div>
        </div>


        <div
          onClick={onClickNext}
          className="relative flex items-center justify-center p-2 rounded-full active:bg-black/10 transition-colors duration-150 cursor-pointer"
        >
          <ForwardIcon/>
        </div>
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
                className={`text-[12px] text-[#7A7A7A] font-paperlogy`}
              >
                {value.day}
              </div>
            }
            {value.date && value.date.length > 1 && (
              <div
                className={`
      text-[14px] leading-none font-paperlogy mt-[6px] mb-[2px]
      w-6 h-6 flex items-center justify-center mx-auto
      ${value.isToday ? 'bg-black text-white rounded-full' : 'text-[#BCBCBC]'}
    `}
              >
                {value.date.split('-')[2]}
              </div>
            )}
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
                    className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-center text-[8px] font-paperlogy pb-2 pt-1
             overflow-hidden text-ellipsis whitespace-nowrap"
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