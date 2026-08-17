'use client'

import React, { useState } from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { PassPlanItem } from "@/app/passPlans/PassPlanItem";
import { RecommendedPassPlanItem } from "@/app/passPlans/RecommendedPassPlanItem";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";
import { Locale } from "@/shared/StringResource";

export const PurchaseStudioPassForm = ({
                                         passPlans,
                                         popularPassPlan,
                                         title,
                                         purchasePassInformationText,
                                         passRefundPolicyText,
                                         purchasePassText,
                                         selectPassPlanText,
                                         studioImageUrl,
                                         locale,
                                         appVersion = '',
                                       }: {
  passPlans: GetPassPlanResponse[],
  popularPassPlan: GetPassPlanResponse,
  title: string,
  purchasePassInformationText: string,
  passRefundPolicyText: string,
  purchasePassText: string,
  selectPassPlanText: string,
  studioImageUrl?: string,
  locale: Locale,
  /** ''이면 웹 직접 접근 — PC(lg)에서 중앙 컬럼 레이아웃. 앱 웹뷰(태블릿 포함)는 기존 그대로. */
  appVersion?: string,
}) => {

  const recommendedPlans = passPlans.filter(p => p.isRecommended);
  const otherPlans = passPlans.filter(p => !p.isRecommended);

  const [passPlan, setPassPlan] = useState<GetPassPlanResponse | null>(popularPassPlan);

  // PC 웹에선 모바일 풀폭 리스트가 훵해서 중앙 560px 컬럼으로 좁힌다. 클라이언트 상태(선택)를 가진 폼이라
  // PC 전용 컴포넌트를 따로 만들지 않고 단일 인스턴스에 반응형 클래스만 얹는다 (티켓 상세와 동일 접근).
  const isWeb = appVersion === '';
  const pcCol = isWeb ? 'lg:w-full lg:max-w-[560px] lg:mx-auto' : '';

  return (
    <div className={`flex flex-col min-h-screen bg-white ${isWeb ? 'lg:items-center lg:pt-10' : ''}`}>
      <div className={`flex flex-col w-full ${pcCol}`}>
      {/* 타이틀 */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        {studioImageUrl && (
          <img src={studioImageUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        )}
        <h1 className="text-[20px] text-black font-bold leading-tight">{selectPassPlanText}</h1>
      </div>

      {/* 추천 패스권 */}
      {recommendedPlans.length > 0 && (
        <div className="flex flex-col px-6 pt-4 gap-3">
          {recommendedPlans.map((item) => (
            <RecommendedPassPlanItem
              key={item.id}
              item={item}
              locale={locale}
              isSelected={passPlan?.id === item.id}
              onClickAction={(item) => setPassPlan(item)}
            />
          ))}
        </div>
      )}

      {/* 나머지 패스권 목록 */}
      {otherPlans.length > 0 && (
        <div className="flex flex-col px-6 pt-3 pb-6 gap-3">
          {otherPlans.map((item) => (
            <PassPlanItem
              key={item.id}
              item={item}
              locale={locale}
              isSelected={passPlan ? passPlan.id === item.id : false}
              onClickAction={(item: GetPassPlanResponse) => {
                setPassPlan(item)
              }}/>
          ))}
        </div>
      )}

      {/* 안내 사항 — PC 컬럼 안에선 풀블리드 대신 라운드 박스 */}
      <div className={`flex flex-col bg-[#F7F8F9] px-6 py-6 gap-3 ${isWeb ? 'lg:rounded-2xl lg:mx-6' : ''}`}>
        <div className="font-bold text-[14px] text-[#555]">{purchasePassInformationText}</div>
        <div className="text-[13px] text-[#999] whitespace-pre-line leading-relaxed">{passRefundPolicyText}</div>
      </div>

      {/* 구매 버튼 */}
      <div className="sticky bottom-3 px-6 mt-4">
        <CommonSubmitButton originProps={{
          onClick: () => {
            kloudNav.push(KloudScreen.Payment('pass-plan', passPlan?.id ?? 0))
          }
        }} disabled={passPlan == null}>
          <div>{passPlan ? `${passPlan.name} 구매하기` : purchasePassText}</div>
        </CommonSubmitButton>
      </div>
      </div>
    </div>
  )
}
