'use server'

import { TimeTable } from "@/app/studios/timetable/TimeTable";
import React from "react";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { getLocale } from "@/utils/translate";

export const TimeTableServerComponent = async ({studioId, day}: { studioId: number, day: string }) => {
  const res = await getTimeTableAction({
    studioId,
  });
  if ('cells' in res) {
    return (
      <div className={'my-4'}>
        <TimeTable timeTable={res} today={day} locale={await getLocale()}/>
      </div>
    )
  }
}