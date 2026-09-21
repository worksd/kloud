import { notFound } from "next/navigation";
import { getStudioRegularClasses } from "@/app/studios/[id]/regularClasses/get.regular.class.list.action";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { StudioRegularClassList } from "@/app/studios/[id]/StudioRegularClassList";
import { getLocale, translate } from "@/utils/translate";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appVersion?: string }>;
};

// 스튜디오 정규반 전체 목록 — 상세의 '정규반 전체보기'. 앱은 네이티브 헤더(kloudNav applyTitle)가 제목을 달고,
// 웹은 페이지 안에 제목을 그린다. 카드는 상세와 같은 컴포넌트(showAll).
export default async function StudioRegularClasses({params, searchParams}: Props) {
  const id = Number((await params).id);
  const {appVersion = ''} = await searchParams;
  if (isNaN(id) || !id) notFound();

  const [res, studio] = await Promise.all([
    getStudioRegularClasses({studioId: id}),
    getStudioDetail(id),
  ]);
  if (isGuinnessErrorCase(res)) {
    return <div className="p-6 text-black">{res.message}</div>;
  }

  const locale = await getLocale();
  const classes = res.regularClasses ?? [];
  const studioImageUrl = 'id' in studio ? studio.profileImageUrl : undefined;
  const isWeb = appVersion === '';

  return (
    <div className={`flex flex-col w-full min-h-screen bg-white ${isWeb ? 'lg:max-w-[640px] lg:mx-auto lg:pt-10' : ''}`}>
      {isWeb && (
        <h1 className="px-4 pt-4 pb-1 text-[20px] font-bold text-black">{await translate('studio_regular_classes')}</h1>
      )}
      <div className="px-4 py-4">
        {classes.length > 0 ? (
          <StudioRegularClassList classes={classes} studioId={id} studioImageUrl={studioImageUrl} locale={locale} showAll />
        ) : (
          <div className="py-16 text-center text-[14px] text-[#86898C]">{await translate('regular_class_empty')}</div>
        )}
      </div>
    </div>
  );
}
