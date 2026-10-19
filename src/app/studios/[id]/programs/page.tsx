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
  searchParams: Promise<{ tab?: string; appVersion?: string; title?: string }>;
};

// 스튜디오 정규반·패스권 전체 목록 — 상세의 '정규반 전체보기'/'패스권 전체보기'가 각자 탭으로 들어온다.
// 앱은 네이티브 헤더(kloudNav applyTitle)가 제목을 달고, 웹은 페이지 안에 같은 제목을 그린다.
// 제목은 ?title=(홈 버튼 문구 ctaText) 우선, 없으면 기본 '정규반·패스권'.
// ?tab=regularClass | pass. 생략(홈 '정규반·패스권' 버튼)하면 정규반이 있으면 정규반, 없으면 패스권 탭. 정규반 카드에서 들어오는 그 반 전용 패스권 구매(/passPlans?regularClassId=)는 별개 플로우.
export default async function StudioProgramsPage({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const { tab, appVersion = '', title: titleParam } = await searchParams;
  if (isNaN(id) || !id) notFound();

  const [regularRes, passRes, studio, locale, popularLabel, title] = await Promise.all([
    getStudioRegularClasses({ studioId: id }),
    getPassPlanListAction({ studioId: id }),
    getStudioDetail(id),
    getLocale(),
    translate('popular'),
    translate('studio_programs_title'),
  ]);
  const pageTitle = titleParam?.trim() || title;
  if (isGuinnessErrorCase(regularRes)) {
    return <div className="p-6 text-black">{regularRes.message}</div>;
  }

  const regularClasses = regularRes.regularClasses ?? [];
  const initialTab: StudioProgramTab =
    tab === 'pass' || tab === 'regularClass' ? tab : (regularClasses.length > 0 ? 'regularClass' : 'pass');
  // 패스권 조회만 실패하면 정규반 탭은 살리고 패스권 탭은 빈 상태로
  const passes = toCommunityPasses('passPlans' in passRes ? passRes.passPlans : [], locale, popularLabel);
  const studioImageUrl = 'id' in studio ? studio.profileImageUrl : undefined;
  const isWeb = appVersion === '';
  return (
    // PC 웹은 카드 2열이라 폭을 넓힌다
    <div className={`flex flex-col w-full min-h-screen bg-white ${isWeb ? 'lg:max-w-[960px] lg:mx-auto lg:pt-6' : ''}`}>
      <StudioProgramsTabs
        studioId={id}
        studioImageUrl={studioImageUrl}
        regularClasses={regularClasses}
        passes={passes}
        initialTab={initialTab}
        locale={locale}
        isWeb={isWeb}
        title={isWeb ? pageTitle : undefined}
      />
    </div>
  );
}
