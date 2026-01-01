import { getMembershipPlanListAction } from "@/app/membershipPlans/action/get.membership.plan.list.action";
import { MembershipPlanListForm } from "@/app/membershipPlans/MembershipPlanListForm";
import { getLocale, translate } from "@/utils/translate";

export default async function MembershipPage({searchParams}: {
  searchParams: Promise<{ appVersion: string, studioId?: string, os: string }>
}) {
  const {os, appVersion, studioId} = await searchParams;
  const res = await getMembershipPlanListAction({studioId: studioId ? parseInt(studioId) : undefined});

  if ('membershipPlans' in res) {
    return (
      <MembershipPlanListForm
        membershipPlans={res.membershipPlans}
        locale={await getLocale()}
      />
    )
  }

  return (
      <div className={'bg-black text-white'}>
        Membership Page {studioId}
      </div>
  )
}