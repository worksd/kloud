"use server";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import Calendar from "../../../../public/assets/calendar.svg";
import Location from "../../../../public/assets/location.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./lesson.info.label";
import { formatDateTime } from "@/utils/date.format";
import { translate } from "@/utils/translate";

export const LessonInfoSection = async ({data}: { data: GetLessonResponse }) => {
  const startTime = await formatDateTime(data.startTime ?? '');

  return <div className="self-stretch px-6 py-5 flex-col justify-start items-start gap-4 flex">
    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
      <LessonInfoLabel Icon={Location} text={data.studio?.name ?? ''} subText={data.room?.name ?? ''}/>

      {data.paymentType == 'Default' &&
        <LessonInfoLabel Icon={Calendar} text={`${startTime.date}(${await translate(startTime.dayOfWeek)})`}
                         subText={data.dday ?? await translate('finish')}/>
      }
      {data.paymentType == 'Subscription' &&
        <LessonInfoLabel Icon={Calendar} text={data.days ?? ''}/>
      }
      <LessonInfoLabel Icon={TimeCircle} text={startTime.time}
                       subText={`${data.duration} ${await translate('minutes')}`}/>

      {(data.limit ?? 0) * 0.9 < (data.currentStudentCount ?? 0) &&
        <LessonInfoLabel Icon={Users} text={`${data.currentStudentCount}`} subText={`${data.limit}`}/>
      }
    </div>
  </div>
}