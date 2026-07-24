'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { GetMyStudioResponse } from "@/app/endpoint/studio.endpoint";
import { Jumbotron } from "@/app/home/Jumbotron";
import { HomeBanner } from "@/app/home/HomeBanner";
import { TodayTimetable } from "@/app/home/TodayTimetable";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { AnnouncementCard } from "@/app/home/AnnouncementCard";
import { HomeBundlesSection } from "@/app/home/HomeBundlesSection";
import { HomeRoomSlotsSection } from "@/app/home/HomeRoomSlotsSection";
import { BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";
import { getLocale, translate } from "@/utils/translate";

export default async function MyStudioPage({res, bundles, roomSlots}: { res: GetMyStudioResponse, bundles?: BundleSummaryResponse[], roomSlots?: RoomSlotsSummaryResponse}) {
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

      {/* 이 스튜디오에서 진행중인 프로모션(번들) — bundles 있을 때만 노출 */}
      <HomeBundlesSection bundles={bundles} studioName={res.studio.name}/>

      {res.bands.map((value) => {
        if (value.type === 'Today') {
          return (
            <React.Fragment key={value.title}>
              {/* 오늘 밴드 위에 주간 시간표 그리드 노출 */}
              <TimeTableServerComponent studioId={res.studio.id} />
              <TodayTimetable
                title={value.title}
                lessons={value.lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  thumbnailUrl: l.thumbnailUrl,
                  startDate: l.startDate,
                  duration: l.duration,
                  type: l.type,
                  roomName: l.roomName,         // 홈 밴드: roomName 문자열 그대로
                  tags: l.label?.tags ?? undefined, // 홈 밴드: 태그는 label.tags 안에 있음
                }))}
                endedLabel={endedLabel}
                ongoingLabel={ongoingLabel}
              />
            </React.Fragment>
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

      {/* 오늘 연습실 예약 — 홈 roomSlots(오늘 공개 홀 슬롯) + studio.practiceRooms 메타 조인 */}
      <HomeRoomSlotsSection studioId={res.studio.id} roomSlots={roomSlots} practiceRooms={res.studio.practiceRooms} locale={locale} />
    </div>
  )
}
