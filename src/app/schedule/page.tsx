import React from "react";
import { NoMyStudioPage } from "@/app/home/NoMyStudioPage";
import { getHomeAction } from "@/app/home/get.home.action";
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

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

  const lessonsRes = await getWeeklyLessonsAction(fmt(monday), fmt(sunday));
  const rawLessons = 'lessons' in lessonsRes ? lessonsRes.lessons : [];

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

  const locale = await getLocale();

  return (
    <SchedulePageClient
      studioImageUrl={res.myStudio.studio.profileImageUrl}
      studioName={res.myStudio.studio.name}
      studioId={res.myStudio.studio.id}
      lessons={lessons}
      locale={locale}
    />
  );
}
