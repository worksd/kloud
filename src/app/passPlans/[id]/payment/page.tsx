import React from "react";
import { PassPaymentInfo } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { CurrentPassPlan } from "@/app/passPlans/[id]/payment/CurrentPassPlan";
import { getPassPlanPaymentAction } from "@/app/passPlans/[id]/payment/get.pass.plan.payment.action";
import { cookies } from "next/headers";
import { depositorKey } from "@/shared/cookies.key";

export default async function PassPayment({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { appVersion , os } = await searchParams
  const res = await getPassPlanPaymentAction({ passPlanId: (await params).id})
  if ('user' in res) {
    return (
      <div>
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource={'purchase_pass_title'}/>
        </div>
        <CurrentPassPlan passPlan={res.passPlan}/>
        <div className="w-full h-3 bg-[#F7F8F9] mb-5"/>
        <PassPaymentInfo
          payment={res}
          price={res.totalPrice}
          url={process.env.GUINNESS_API_SERVER ?? ''}
          appVersion={appVersion}
          beforeDepositor={(await cookies()).get(depositorKey)?.value ?? ''}
        />
      </div>
    )
  }
}