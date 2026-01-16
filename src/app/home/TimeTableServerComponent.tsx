'use server'

import { TimeTable } from "@/app/studios/timetable/TimeTable";
import React from "react";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { getLocale } from "@/utils/translate";

export const TimeTableServerComponent = async ({studioId}: { studioId: number }) => {
  const res = await getTimeTableAction({
    studioId,
  });
  if ('cells' in res) {
    return (
      <div className={'my-4'}>
        <TimeTable studioId={studioId} timeTable={res} locale={await getLocale()}/>
      </div>
    )
  }
}