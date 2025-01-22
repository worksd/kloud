"use client";

import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { calculateDDays } from "@/utils";
import Calendar from "../../../../public/assets/calendar.svg";
import Location from "../../../../public/assets/location.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./lesson.info.label";

export function formatDateTime(input: string): { time: string; date: string } {
    try {
        const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

        const [datePart, timePart] = input.split(" ");
        const [year, month, day] = datePart.split(".").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);

        const dateObj = new Date(year, month - 1, day, hour, minute);

        const hours = dateObj.getHours();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHour = hours % 12 || 12;
        const time = `${ampm} ${formattedHour}:${minute.toString().padStart(2, "0")}`;

        const dayOfWeek = daysOfWeek[dateObj.getDay()];
        const date = `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")} (${dayOfWeek})`;

        return {time, date};
    } catch (e) {
        return {
            time: '',
            date: ''
        }
    }
}

const LessonInfoSection = ({data}: {data: GetLessonResponse}) => {
    const startTime = formatDateTime(data.startTime ?? '');

    return <div className="self-stretch h-40 px-6 py-5 flex-col justify-start items-start gap-4 flex">
        <div className="self-stretch h-[120px] flex-col justify-start items-start gap-2 flex">
            <LessonInfoLabel Icon={Location} text={data.studio?.name ?? ''} subText={data.room?.name ?? ''} />

            <LessonInfoLabel Icon={Calendar} text={startTime.date} subText={calculateDDays(data.startTime ?? '') ?? ''} />

            <LessonInfoLabel Icon={TimeCircle} text={startTime.time} subText={`${data.duration}분`} />

            <LessonInfoLabel Icon={Users} text={data.currentStudentCount + ""} subText={data.room?.maxNumber + "" } />
        </div>
    </div>
}

export default LessonInfoSection;