'use server'

import { TimeTable } from "@/app/studios/timetable/TimeTable";
import React from "react";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { getLocale } from "@/utils/translate";
import { AnalyticsEvent } from "@/app/lib/analytics";

export const TimeTableServerComponent = async ({studioId, useSheet = false, noMargin = false, clickEvent, hqImages = false, topDivider = false}: { studioId: number, useSheet?: boolean, noMargin?: boolean, clickEvent?: AnalyticsEvent, hqImages?: boolean, topDivider?: boolean }) => {
  const res = await getTimeTableAction({
    studioId,
  });
  if ('cells' in res) {
    return (
      <>
        {/* 섹션 구분선 — 시간표가 실제로 그려질 때만 (조회 실패 시 구분선만 남는 것 방지) */}
        {topDivider && <div className="w-full h-2 bg-[#f7f8f9] mt-6"/>}
        <div className={noMargin ? '' : 'my-4'}>
          <TimeTable studioId={studioId} timeTable={res} locale={await getLocale()} useSheet={useSheet} clickEvent={clickEvent} hqImages={hqImages}/>
        </div>
      </>
    )
  }
}