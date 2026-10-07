import { notFound } from "next/navigation";
import { getStudioRegularClasses } from "@/app/studios/[id]/regularClasses/get.regular.class.list.action";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { toCommunityPasses } from "@/app/studios/[id]/pass.plan.mapper";
import { StudioProgramsTabs, StudioProgramTab } from "@/app/studios/[id]/programs/StudioProgramsTabs";
import { getLocale, translate } from "@/utils/translate";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; appVersion?: string }>;
};

// 스튜디오 정규반·패스권 전체 목록 — 상세의 '정규반 전체보기'/'패스권 전체보기'가 각자 탭으로 들어온다.
// 제목 없이 상단 탭이 헤더 역할을 한다 (앱 네이티브 헤더도 빈 제목).
// ?tab=regularClass | pass (기본 regularClass). 정규반 카드에서 들어오는 그 반 전용 패스권 구매(/passPlans?regularClassId=)는 별개 플로우.
export default async function StudioProgramsPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const { tab, appVersion = '' } = await searchParams;
  if (isNaN(id) || !id) notFound();

  const initialTab: StudioProgramTab = tab === 'pass' ? 'pass' : 'regularClass';

  const [regularRes, passRes, studio, locale, popularLabel] = await Promise.all([
    getStudioRegularClasses({ studioId: id }),
    getPassPlanListAction({ studioId: id }),
    getStudioDetail(id),
    getLocale(),
    translate('popular'),
  ]);
  if (isGuinnessErrorCase(regularRes)) {
    return <div className="p-6 text-black">{regularRes.message}</div>;
  }

  const regularClasses = regularRes.regularClasses ?? [];
  // 패스권 조회만 실패하면 정규반 탭은 살리고 패스권 탭은 빈 상태로
  const passes = toCommunityPasses('passPlans' in passRes ? passRes.passPlans : [], locale, popularLabel);
  const studioImageUrl = 'id' in studio ? studio.profileImageUrl : undefined;
  const isWeb = appVersion === '';
  return (
    <div className={`flex flex-col w-full min-h-screen bg-white pt-2 ${isWeb ? 'lg:max-w-[640px] lg:mx-auto lg:pt-10' : ''}`}>
      <StudioProgramsTabs
        studioId={id}
        studioImageUrl={studioImageUrl}
        regularClasses={regularClasses}
        passes={passes}
        initialTab={initialTab}
        locale={locale}
      />
    </div>
  );
}
