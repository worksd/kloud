'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { getLocale } from "@/utils/translate";
import { GetMyStudioResponse } from "@/app/endpoint/studio.endpoint";
import { MembershipBand } from "@/app/home/MembershipBand";
import { Jumbotron } from "@/app/home/Jumbotron";
import { HomeBanner } from "@/app/home/HomeBanner";

export default async function MyStudioPage({res}: { res: GetMyStudioResponse}) {
  if (!res) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }

  // 점보트론
  const jumbotronSource = res.jumbotrons && res.jumbotrons.length > 0
    ? res.jumbotrons
    : res.bands.flatMap(b => b.lessons).filter(l => l.thumbnailUrl).slice(0, 8);

  const jumbotronItems = jumbotronSource.map(l => ({
    id: l.id,
    imageUrl: l.thumbnailUrl,
    title: l.title,
    artistName: (l.artists?.[0]?.name ?? l.artists?.[0]?.nickName) ?? l.artist?.nickName,
    artistImageUrl: l.artists?.[0]?.profileImageUrl ?? l.artist?.profileImageUrl,
  }));


  return (
    <div className={'flex flex-col overflow-y-auto no-scrollbar pb-32'}>
      {/* 점보트론 */}
      {jumbotronItems.length > 0 && (
        <Jumbotron items={jumbotronItems} />
      )}

      {/* 배너 */}
      {res.banners && res.banners.length > 0 && (
        <HomeBanner banners={res.banners} />
      )}

      {res.membership && (
        <MembershipBand membership={res.membership} locale={await getLocale()} />
      )}
      {res.bands.map((value) => (
        <LessonBand
          key={value.title}
          title={value.title}
          lessons={value.lessons}
          type={value.type}
        />
      ))}
    </div>
  )
}
