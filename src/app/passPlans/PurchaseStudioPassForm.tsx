'use client'

import React, { useState } from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { PassPlanItem } from "@/app/passPlans/PassPlanItem";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { TranslatableText } from "@/utils/TranslatableText";
import { kloudNav } from "@/app/lib/kloudNav";

export const PurchaseStudioPassForm = ({passPlans, popularPassPlan, title}: {
  passPlans: GetPassPlanResponse[],
  popularPassPlan: GetPassPlanResponse,
  title: string
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
              isSelected={passPlan ? passPlan.id === item.id : passPlans.find(p => p.isPopular)?.id === item.id}
              onClickAction={(item: GetPassPlanResponse) => {
                setPassPlan(item)
              }}/>
          ))}
        </ul>
      )}
      <div className={"flex flex-col bg-[#F7F8F9] p-6 text-[#86898C] space-y-4"}>
        <TranslatableText className={"font-bold text-[16px]"} titleResource={'purchase_pass_information'}/>
        <TranslatableText className={"text-[14px]"} titleResource={'pass_refund_policy'}/>
      </div>

      <div className={"sticky bottom-0 px-6"}>
        <CommonSubmitButton originProps={{
          onClick: () => {
            kloudNav.push(KloudScreen.PassPayment(passPlan?.id ?? 0))
          }
        }} disabled={passPlan == null}>
          <TranslatableText titleResource={'purchase_pass_title'}/>
        </CommonSubmitButton>
      </div>

    </div>
  )
}