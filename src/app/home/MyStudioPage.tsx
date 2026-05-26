'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { GetMyStudioResponse } from "@/app/endpoint/studio.endpoint";
import { Jumbotron } from "@/app/home/Jumbotron";
import { HomeBanner } from "@/app/home/HomeBanner";
import { TodayTimetable } from "@/app/home/TodayTimetable";
import { AnnouncementCard } from "@/app/home/AnnouncementCard";
import { getLocale, translate } from "@/utils/translate";

export default async function MyStudioPage({res}: { res: GetMyStudioResponse}) {
  if (!res) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }
  const locale = await getLocale();
  const endedLabel = await translate('finish');
  const ongoingLabel = await translate('in_progress');

  // 점보트론
  const jumbotronSource = res.jumbotrons && res.jumbotrons.length > 0
    ? res.jumbotrons
    : res.bands.flatMap(b => b.lessons).filter(l => l.thumbnailUrl).slice(0, 8);

  const jumbotronItems = jumbotronSource.map(l => ({
    id: l.id,
    imageUrl: l.thumbnailUrl,
    title: l.title,
    artistName: (l.artists?.[0]?.nickName ?? l.artists?.[0]?.name) ?? l.artist?.nickName,
    artistImageUrl: l.artists?.[0]?.profileImageUrl ?? l.artist?.profileImageUrl,
  }));


  return (
    <div className={'flex flex-col overflow-y-auto no-scrollbar pb-32'}>
      {/* 점보트론 */}
      {jumbotronItems.length > 0 && (
        <Jumbotron items={jumbotronItems} />
      )}

      {/* 공지사항 — 최근 7일 내 최신 1건 */}
      {res.announcement && (
        <AnnouncementCard announcement={res.announcement} studioId={res.studio.id} showMore locale={locale} />
      )}

      {/* 배너 */}
      {res.banners && res.banners.length > 0 && (
        <HomeBanner banners={res.banners} />
      )}

      {res.bands.map((value) => {
        if (value.type === 'Today') {
          return (
            <TodayTimetable
              key={value.title}
              title={value.title}
              lessons={value.lessons}
              endedLabel={endedLabel}
              ongoingLabel={ongoingLabel}
            />
          );
        }
        return (
          <LessonBand
            key={value.title}
            title={value.title}
            lessons={value.lessons}
            type={value.type}
            label={value.label}
          />
        );
      })}
    </div>
  )
}
