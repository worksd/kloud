'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { GetMyStudioResponse, StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { Jumbotron } from "@/app/home/Jumbotron";
import { BannerCarousel } from "@/app/components/BannerCarousel";
import { TodayTimetable } from "@/app/home/TodayTimetable";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { AnnouncementCard } from "@/app/home/AnnouncementCard";
import { HomeBundlesSection } from "@/app/home/HomeBundlesSection";
import { HomeRoomSlotsSection } from "@/app/home/HomeRoomSlotsSection";
import { StudioRegularClassList } from "@/app/studios/[id]/StudioRegularClassList";
import { BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { RoomSlotsSummaryResponse } from "@/app/endpoint/studio.room.endpoint";
import { getLocale, translate } from "@/utils/translate";

export default async function MyStudioPage({res, bundles, regularClasses, roomSlots, myBookings}: { res: GetMyStudioResponse, bundles?: BundleSummaryResponse[], regularClasses?: StudioRegularClassResponse[], roomSlots?: RoomSlotsSummaryResponse, myBookings?: { id: number; studioRoomId: number; roomName: string; startDate: string; endDate: string }[]}) {
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

      {/* 배너 — 공용 캐러셀(자동 넘김·카운터·옆 배너 peek). 양옆 20px 은 다른 홈 섹션(px-5)과 맞춘 값 */}
      {res.banners && res.banners.length > 0 && (
        <BannerCarousel banners={res.banners} inset={20} className="py-2" />
      )}

      {/* 이 스튜디오에서 진행중인 프로모션(번들) — bundles 있을 때만 노출 */}
      <HomeBundlesSection bundles={bundles} studioName={res.studio.name}/>

      {/* 이 스튜디오의 판매중 정규반 — 밴드는 전부 내려주므로 4개까지 + 전체보기(정규반 탭). 탭하면 정규반 결제로 */}
      {regularClasses && regularClasses.length > 0 && (
        <section className="flex flex-col px-5 pb-2">
          <h2 className="text-[18px] text-black font-bold pt-5 pb-3 px-1">{(await translate('home_regular_classes_title')).replace('{studioName}', res.studio.name)}</h2>
          <StudioRegularClassList classes={regularClasses} studioId={res.studio.id} studioImageUrl={res.studio.profileImageUrl} locale={locale} complete />
        </section>
      )}

      {res.bands.map((value) => {
        if (value.type === 'Today') {
          return (
            <React.Fragment key={value.title}>
              {/* 오늘 밴드 위에 주간 시간표 그리드 노출 */}
              <TimeTableServerComponent studioId={res.studio.id} clickEvent="click_band_timetable" />
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
      <HomeRoomSlotsSection studioId={res.studio.id} roomSlots={roomSlots} myBookings={myBookings} practiceRooms={res.studio.practiceRooms} locale={locale} />
    </div>
  )
}
