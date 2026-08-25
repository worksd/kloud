import React from "react";
import { NoMyStudioPage } from "@/app/home/NoMyStudioPage";
import { getHomeAction } from "@/app/home/get.home.action";
import { SchedulePageClient } from "@/app/schedule/SchedulePageClient";
import { getWeeklyLessonsAction } from "@/app/schedule/get.weekly.lessons.action";
import { getLocale } from "@/utils/translate";
import { TrackView } from "@/app/components/TrackView";
import { parseHomeBands } from "@/app/home/home.bands";

export default async function SchedulePage() {
  const res = await getHomeAction();

  if (!('bands' in res)) return null;
  const home = parseHomeBands(res);

  if (!home.myStudio) {
    return (
      <div className="bg-white min-h-screen">
        <TrackView event="enter_schedule"/>
        <NoMyStudioPage studios={home.recommendedStudios} />
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
      room: l.room?.name,
      date: datePart,
      tags: l.label?.tags ?? undefined,
      duration: l.duration,
      artistName: (l.artists?.[0]?.nickName ?? l.artists?.[0]?.name) ?? l.artist?.nickName ?? l.artist?.name ?? undefined,
    };
  });

  const locale = await getLocale();

  return (
    <>
    <TrackView event="enter_schedule" props={{studioId: home.myStudio.studio.id}}/>
    <SchedulePageClient
      studioImageUrl={home.myStudio.studio.profileImageUrl}
      studioName={home.myStudio.studio.name}
      studioId={home.myStudio.studio.id}
      lessons={lessons}
      locale={locale}
    />
    </>
  );
}
