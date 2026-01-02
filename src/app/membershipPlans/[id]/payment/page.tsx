import React from "react";
import { MembershipPaymentInfo } from "@/app/membershipPlans/[id]/payment/MembershipPaymentInfo";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { CurrentMembershipPlan } from "@/app/membershipPlans/[id]/payment/CurrentMembershipPlan";
import { getMembershipPaymentAction } from "@/app/membershipPlans/[id]/payment/get.membership.payment.action";
import { cookies } from "next/headers";
import { depositorKey } from "@/shared/cookies.key";
import { getLocale } from "@/utils/translate";

export default async function MembershipPayment({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { appVersion , os } = await searchParams
  const res = await getMembershipPaymentAction({ membershipPlanId: (await params).id })
  
  if ('user' in res) {
    return (
      <div>
        {appVersion == '' &&
          <div className="flex justify-between items-center mb-14">
            <SimpleHeader titleResource={'purchase_pass_title'}/>
          </div>
        }
        {res.membershipPlan && (
          <CurrentMembershipPlan 
            membershipPlan={res.membershipPlan}
            locale={await getLocale()}
          />
        )}
        <div className="w-full h-3 bg-[#F7F8F9] mb-5"/>
        <MembershipPaymentInfo
          locale={await getLocale()}
          payment={res}
          price={res.totalPrice}
          url={process.env.GUINNESS_API_SERVER ?? ''}
          appVersion={appVersion}
          beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
          membershipPlanName={res.membershipPlan?.name ?? ''}
        />
      </div>
    )
  }
}

