import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { CurrentMembershipPlan } from "@/app/membershipPlans/[id]/payment/CurrentMembershipPlan";
import { getMembershipPaymentAction } from "@/app/membershipPlans/[id]/payment/get.membership.payment.action";
import { UnifiedPaymentInfo } from "@/app/payment/UnifiedPaymentInfo";
import { cookies } from "next/headers";
import { depositorKey } from "@/shared/cookies.key";
import { getLocale } from "@/utils/translate";

export default async function MembershipPayment({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { appVersion } = await searchParams
  const res = await getMembershipPaymentAction({ membershipPlanId: (await params).id })

  if ('user' in res) {
    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
        {appVersion == '' &&
          <div className="mb-2">
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
        <UnifiedPaymentInfo
          type="membership-plan"
          url={process.env.GUINNESS_API_SERVER ?? ''}
          appVersion={appVersion}
          payment={res}
          beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
          locale={await getLocale()}
        />
      </div>
    )
  }
}
