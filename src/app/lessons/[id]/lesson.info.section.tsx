"use client";

import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { calculateDDays } from "@/utils";
import Calendar from "../../../../public/assets/calendar.svg";
import Location from "../../../../public/assets/location.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./lesson.info.label";
import { formatDateTime } from "@/utils/date.format";
const LessonInfoSection = ({data}: {data: GetLessonResponse}) => {
    const startTime = formatDateTime(data.startTime ?? '');

    return <div className="self-stretch px-6 py-5 flex-col justify-start items-start gap-4 flex">
        <div className="self-stretch flex-col justify-start items-start gap-2 flex">
            <LessonInfoLabel Icon={Location} text={data.studio?.name ?? ''} subText={data.room?.name ?? ''} />

            <LessonInfoLabel Icon={Calendar} text={`${startTime.date}(${startTime.dayOfWeek})`} subText={calculateDDays(data.startTime ?? '') ?? '종료'} />

            <LessonInfoLabel Icon={TimeCircle} text={startTime.time} subText={`${data.duration}분`} />

            {(data.limit ?? 0) * 0.7 < (data.currentStudentCount ?? 0) &&
              <LessonInfoLabel Icon={Users} text={`${data.currentStudentCount}`} subText={`${data.limit}`}/>
            }
        </div>
    </div>
}

export default LessonInfoSection;