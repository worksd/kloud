import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { PurchaseStudioPassForm } from "@/app/passPlans/PurchaseStudioPassForm";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLocale, translate } from "@/utils/translate";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function PassPage({searchParams}: { searchParams: Promise<{ studioId?: string, appVersion?: string }> }) {
  const {studioId: rawStudioId, appVersion = ''} = await searchParams;
  // studioId 없이 진입(크롤러/직접 URL)하면 GET /studios/undefined가 나가던 문제 — 웹만 홈으로 보낸다.
  // 앱 웹뷰(x-guinness-version 있음)는 네이티브가 항상 studioId를 넘기므로 기존대로 에러 다이얼로그에 맡긴다.
  const studioId = Number(rawStudioId);
  if (!rawStudioId || Number.isNaN(studioId)) {
    const isWeb = ((await headers()).get('x-guinness-version') ?? '') === '';
    if (isWeb) redirect('/');
  }
  const studioRes = await getStudioDetail(studioId);
  const res = await getPassPlanListAction({studioId});

  if ('passPlans' in res && 'id' in studioRes) {
    return (
      <PurchaseStudioPassForm
        title={studioRes.name + await translate('purchase_pass')}
        passPlans={res.passPlans}
        popularPassPlan={res.passPlans?.find((value) => value.isPopular) ?? res.passPlans[0]}
        passRefundPolicyText={await translate('pass_refund_policy')}
        purchasePassText={await translate('purchase_pass')}
        purchasePassInformationText={await translate('purchase_pass_information')}
        selectPassPlanText={await translate('select_pass_plan')}
        studioImageUrl={studioRes.profileImageUrl}
        locale={await getLocale()}
        appVersion={appVersion}
      />
    )
  }
}