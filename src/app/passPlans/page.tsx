import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PurchaseStudioPassForm } from "@/app/passPlans/PurchaseStudioPassForm";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLocale, translate } from "@/utils/translate";
import Link from "next/link";
import React from "react";

type MockStudioPassEntry = {
  studioId: number;
  studioName: string;
  studioImageUrl: string;
  topPassName: string;
  topPassPrice: number;
  coverImageUrl: string;
};

// studioId 없을 때 PC mock — 추후 BE에 글로벌 list 엔드포인트 추가되면 실데이터로 교체
const MOCK_STUDIOS: MockStudioPassEntry[] = [
  {
    studioId: 14,
    studioName: '에스파이어 서울',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    topPassName: '월 무제한 패스',
    topPassPrice: 220000,
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
  },
  {
    studioId: 1,
    studioName: '로우그래피',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    topPassName: '10회권',
    topPassPrice: 150000,
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
  },
];

export default async function PassPage({searchParams}: { searchParams: Promise<{ studioId?: string }> }) {
  const {studioId: rawStudioId} = await searchParams;
  const studioId = rawStudioId ? Number(rawStudioId) : undefined;

  // studioId 있을 때 — 기존 동작 (특정 스튜디오의 pass plan 구매 폼)
  if (studioId && !isNaN(studioId)) {
    const studioRes = await getStudioDetail(studioId);
    const res = await getPassPlanListAction({studioId});

    if ('passPlans' in res && 'id' in studioRes) {
      return (
        <PurchaseStudioPassForm
          title={studioRes.name + await translate('purchase_pass')}
          passPlans={res.passPlans}
          popularPassPlan={res.passPlans?.find((value) => value.isPopular) ?? res.passPlans[0]}
          passRefundPolicyText={await translate('pass_refund_policy')}
          purchasePassText={await translate('purchase_pass')}
          purchasePassInformationText={await translate('purchase_pass_information')}
          selectPassPlanText={await translate('select_pass_plan')}
          studioImageUrl={studioRes.profileImageUrl}
          locale={await getLocale()}
        />
      )
    }
    return null;
  }

  // studioId 없을 때 — PC mock: 스튜디오별 패스권 모아보기 카드 그리드
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-8 pt-24 pb-20">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-black tracking-tight">패스권</h1>
          <p className="text-[14px] text-[#86898C] mt-1">스튜디오별 패스권을 둘러보세요 <span className="ml-1 text-[#BCBFC2]">· mock data</span></p>
        </header>

        <div className="grid grid-cols-2 gap-6">
          {MOCK_STUDIOS.map((s) => (
            <Link
              key={s.studioId}
              href={`/passPlans?studioId=${s.studioId}`}
              className="relative rounded-2xl overflow-hidden bg-[#F1F3F6] aspect-[16/9] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.coverImageUrl}
                alt={s.studioName}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.studioImageUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shrink-0"/>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[17px] font-bold text-white truncate">{s.studioName}</span>
                    <span className="text-[12px] text-white/80 truncate">{s.topPassName}부터</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="text-[15px] font-bold text-white">
                    {new Intl.NumberFormat('ko-KR').format(s.topPassPrice)}원~
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
