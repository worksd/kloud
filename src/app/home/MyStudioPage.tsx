'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { PassBand } from "@/app/studios/PassBand";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier } from "@/app/endpoint/pass.endpoint";
import { GetMyStudioResponse } from "@/app/endpoint/studio.endpoint";
import { MembershipBand } from "@/app/home/MembershipBand";
import { Jumbotron } from "@/app/home/Jumbotron";
import { HomeBanner } from "@/app/home/HomeBanner";

export default async function MyStudioPage({res}: { res: GetMyStudioResponse}) {
  if (!res) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }

  // 점보트론: bands의 모든 lesson 썸네일에서 추출 (Mock — API 준비되면 교체)
  const jumbotronItems = res.bands
    .flatMap(b => b.lessons)
    .filter(l => l.thumbnailUrl)
    .slice(0, 8)
    .map(l => ({ id: l.id, imageUrl: l.thumbnailUrl }));

  // 배너 Mock — API 준비되면 교체
  const mockBanner = {
    title: '스튜디오 소식을 확인해보세요',
    linkText: '자세히 보기',
    route: `/studios/${res.studio.id}`,
  };

  return (
    <div className={'flex flex-col overflow-y-auto no-scrollbar pb-32'}>
      {/* 점보트론 */}
      {jumbotronItems.length > 0 && (
        <Jumbotron items={jumbotronItems} />
      )}

      {/* 배너 */}
      <HomeBanner banner={mockBanner} />

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
      {res.passes && res.passes.length > 0 &&
        <PassBand title={await translate('my_pass')} passes={res.passes ?? []} locale={await getLocale()}/>
      }
    </div>
  )
}
