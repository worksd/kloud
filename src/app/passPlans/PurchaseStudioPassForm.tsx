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
}) => {

  // TODO: API에서 isRecommended 필드가 내려오면 그걸 사용. 현재는 첫 번째 패스권을 추천으로 처리
  const recommendedPlan = passPlans.find(p => p.isRecommended) ?? passPlans[0];
  const otherPlans = passPlans.filter(p => p.id !== recommendedPlan?.id);

  const [passPlan, setPassPlan] = useState<GetPassPlanResponse | null>(popularPassPlan);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 타이틀 */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        {studioImageUrl && (
          <img src={studioImageUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        )}
        <h1 className="text-[20px] text-black font-bold leading-tight">{selectPassPlanText}</h1>
      </div>

      {/* 추천 패스권 */}
      {recommendedPlan && (
        <div className="px-6 pt-4">
          <RecommendedPassPlanItem
            item={recommendedPlan}
            locale={locale}
            isSelected={passPlan?.id === recommendedPlan.id}
            onClickAction={(item) => setPassPlan(item)}
          />
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

      {/* 안내 사항 */}
      <div className="flex flex-col bg-[#F7F8F9] px-6 py-6 gap-3">
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
  )
}
