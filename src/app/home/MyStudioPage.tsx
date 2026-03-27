'use server'

import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { PassBand } from "@/app/studios/PassBand";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier } from "@/app/endpoint/pass.endpoint";
import { GetMyStudioResponse } from "@/app/endpoint/studio.endpoint";
import { MembershipBand } from "@/app/home/MembershipBand";

export default async function MyStudioPage({res}: { res: GetMyStudioResponse}) {
  if (!res) {
    return <div className={'text-black'}>등록된 스튜디오가 없습니다</div>
  }
  const hasPremiumPass = res.passes?.find((value) => value.passPlan?.tier == PassPlanTier.Premium) != null
  const backgroundColor = hasPremiumPass ? 'bg-[#FBFBFF]' : 'bg-gray-100'
  const borderColor =
    hasPremiumPass ? 'border-[#E1CBFE]' : 'border-[#F1F3F6]'

  return (
    <div className={'flex flex-col overflow-y-auto no-scrollbar pb-10'}>
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