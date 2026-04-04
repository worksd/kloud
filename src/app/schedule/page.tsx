import React from "react";
import { NoMyStudioPage } from "@/app/home/NoMyStudioPage";
import { getHomeAction } from "@/app/home/get.home.action";
import { ScheduleTabView } from "@/app/schedule/ScheduleTabView";
import { SchedulePageClient } from "@/app/schedule/SchedulePageClient";
import { getWeeklyLessonsAction } from "@/app/schedule/get.weekly.lessons.action";
import { getLocale } from "@/utils/translate";

export default async function SchedulePage() {
  const res = await getHomeAction();

  if (!('studios' in res)) return null;

  if (!res.myStudio) {
    return (
      <div className="bg-white min-h-screen">
        <NoMyStudioPage studios={res.recommendedStudios} />
      </div>
    );
  }

  const lessonsRes = await getWeeklyLessonsAction();
  const rawLessons = 'lessons' in lessonsRes ? lessonsRes.lessons : [];

  // API 응답을 ScheduleTabView 형식으로 변환
  const lessons = rawLessons.map((l: any) => {
    const startDateParts = (l.startDate ?? '').split(' ');
    const datePart = (startDateParts[0] ?? '').replace(/\./g, '-');
    const timePart = startDateParts[1] ?? '';

    return {
      id: l.id,
      title: l.title,
      thumbnailUrl: l.thumbnailUrl ?? '',
      startTime: timePart,
      endTime: '',
      room: undefined as string | undefined,
      date: datePart,
    };
  });

  return (
    <SchedulePageClient studioImageUrl={res.myStudio.studio.profileImageUrl}>
      <ScheduleTabView
        lessons={lessons}
        studioName={res.myStudio.studio.name}
        studioImageUrl={res.myStudio.studio.profileImageUrl}
        locale={await getLocale()}
      />
    </SchedulePageClient>
  );
}
