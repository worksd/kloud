import React from "react";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { PassPlanSheet } from "@/app/studios/[id]/passPlans/PassPlanSheet";
import { getLocale } from "@/utils/translate";

export default async function StudioPassPlansPage({params, searchParams}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ passPlanId: string }>
}) {
  const res = await getPassPlanListAction({studioId: Number((await params).id)})
  if ('passPlans' in res) {
    return (
      <PassPlanSheet
        passPlans={res.passPlans}
        currentPassPlanId={(await searchParams).passPlanId}
        locale={await getLocale()}
      />
    )
  }
}