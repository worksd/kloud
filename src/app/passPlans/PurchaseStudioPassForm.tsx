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
    <div className={"flex flex-col"}>
      <div className={"text-[24px] text-black font-medium px-6 mt-4"}>{title}</div>
      {passPlan && passPlans.length > 0 && (
        <ul className="flex flex-col p-6 space-y-4 mt-4">
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
        </ul>
      )}
      <div className={"flex flex-col bg-[#F7F8F9] p-6 text-[#86898C] space-y-4"}>
        <div className={"font-bold text-[16px]"}>{purchasePassInformationText}</div>
        <div className={"text-[14px] whitespace-pre-line"}>{passRefundPolicyText}</div>
      </div>

      <div className={"sticky bottom-3 px-6"}>
        <CommonSubmitButton originProps={{
          onClick: () => {
            kloudNav.push(KloudScreen.PassPayment(passPlan?.id ?? 0))
          }
        }} disabled={passPlan == null}>
          <div>{purchasePassText}</div>
        </CommonSubmitButton>
      </div>

    </div>
  )
}