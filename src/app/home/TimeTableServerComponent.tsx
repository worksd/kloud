'use server'

import { TimeTable } from "@/app/studios/timetable/TimeTable";
import React from "react";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { getLocale } from "@/utils/translate";

export const TimeTableServerComponent = async ({studioId, useSheet = false, noMargin = false}: { studioId: number, useSheet?: boolean, noMargin?: boolean }) => {
  const res = await getTimeTableAction({
    studioId,
  });
  if ('cells' in res) {
    return (
      <div className={noMargin ? '' : 'my-4'}>
        <TimeTable studioId={studioId} timeTable={res} locale={await getLocale()} useSheet={useSheet}/>
      </div>
    )
  }
}