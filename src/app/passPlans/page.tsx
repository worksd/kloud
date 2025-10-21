import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PurchaseStudioPassForm } from "@/app/passPlans/PurchaseStudioPassForm";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { translate } from "@/utils/translate";

export default async function PassPage({searchParams}: { searchParams: Promise<{ studioId: number }> }) {
  const {studioId} = await searchParams;
  const studioRes = await getStudioDetail(studioId);
  const res = await getPassPlanListAction({studioId});

  if ('passPlans' in res && 'id' in studioRes) {
    return (
      <PurchaseStudioPassForm
        title={studioRes.name + await translate('purchase_pass')}
        passPlans={res.passPlans}
        popularPassPlan={res.passPlans?.find((value) => value.isPopular) ?? res.passPlans[0]}/>
    )
  }
}