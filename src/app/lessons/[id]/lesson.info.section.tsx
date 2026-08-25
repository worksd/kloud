"use server";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import Calendar from "../../../../public/assets/calendar.svg";
import Location from "../../../../public/assets/location.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./lesson.info.label";
import { formatDateTime } from "@/utils/date.format";
import { getLocale, translate } from "@/utils/translate";
import { weeklyDaysLabel } from "@/utils/weekly.days";

export const LessonInfoSection = async ({data}: { data: GetLessonResponse }) => {
  // 매주 반복 요일(days: 0=일~6=토) — 정기 판매 방식들의 요일 합집합. 있으면 날짜 아래에 '매주 월·수' 표기
  const repeatLabel = weeklyDaysLabel(data.days, await getLocale());

  return <div className="self-stretch px-6 py-5 flex-col justify-start items-start gap-4 flex">
    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
      <LessonInfoLabel Icon={Location} text={data.studio?.name ?? ''} subText={data.room?.name ?? ''}/>
      <LessonInfoLabel Icon={TimeCircle} text={data.date ?? ''}
                       subText={`${data.duration} ${await translate('minutes')}`}/>
      {repeatLabel && <LessonInfoLabel Icon={Calendar} text={repeatLabel}/>}

      {(data.limit ?? 0) * 0.9 < (data.currentStudentCount ?? 0) &&
        <LessonInfoLabel Icon={Users} text={`${data.currentStudentCount}`} subText={`${data.limit}`}/>
      }
    </div>
  </div>
}