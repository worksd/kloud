'use client'

import React, { useState } from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { PassPlanItem } from "@/app/passPlans/PassPlanItem";
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
                                         locale,
                                       }: {
  passPlans: GetPassPlanResponse[],
  popularPassPlan: GetPassPlanResponse,
  title: string,
  purchasePassInformationText: string,
  passRefundPolicyText: string,
  purchasePassText: string
  locale: Locale,
}) => {

  const [passPlan, setPassPlan] = useState<GetPassPlanResponse | null>(popularPassPlan);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 타이틀 */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-[22px] text-black font-bold leading-tight">{title}</h1>
      </div>

      {/* 패스권 목록 */}
      {passPlan && passPlans.length > 0 && (
        <div className="flex flex-col px-6 pt-4 pb-6 gap-3">
          {passPlans.map((item) => (
            <PassPlanItem
              key={item.id}
              item={item}
              locale={locale}
              isSelected={passPlan ? passPlan.id === item.id : passPlans.find(p => p.isPopular)?.id === item.id}
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
          <div>{purchasePassText}</div>
        </CommonSubmitButton>
      </div>
    </div>
  )
}
