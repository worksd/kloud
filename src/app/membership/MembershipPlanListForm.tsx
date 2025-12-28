'use client'

import React, { useState } from "react";
import { GetMembershipPlanResponse } from "@/app/endpoint/membership.endpoint";
import { MembershipPlanItem } from "@/app/membership/MembershipPlanItem";
import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";
import { Locale } from "@/shared/StringResource";

export const MembershipPlanListForm = ({
  membershipPlans,
  title,
  locale,
}: {
  membershipPlans: GetMembershipPlanResponse[],
  title: string,
  locale: Locale,
}) => {

  const [membershipPlan, setMembershipPlan] = useState<GetMembershipPlanResponse | null>(
    membershipPlans.length > 0 ? membershipPlans[0] : null
  );

  return (
    <div className={"flex flex-col"}>
      <div className={"text-[24px] text-black font-medium px-6 mt-4"}>{title}</div>
      {membershipPlan && membershipPlans.length > 0 && (
        <ul className="flex flex-col p-6 space-y-4 mt-4">
          {membershipPlans.map((item) => (
            <MembershipPlanItem
              key={item.id}
              item={item}
              locale={locale}
              isSelected={membershipPlan ? membershipPlan.id === item.id : false}
              onClickAction={(item: GetMembershipPlanResponse) => {
                setMembershipPlan(item)
              }}/>
          ))}
        </ul>
      )}
      <div className={"sticky bottom-3 px-6"}>
        <CommonSubmitButton originProps={{
          onClick: () => {
            kloudNav.push(KloudScreen.MembershipPayment(membershipPlan?.id ?? 0))
          }
        }} disabled={membershipPlan == null}>
          <div>결제하기</div>
        </CommonSubmitButton>
      </div>
    </div>
  )
}

