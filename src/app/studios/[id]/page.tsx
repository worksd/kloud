import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { StudioDetailPcForm } from "@/app/studios/[id]/StudioDetailPcForm";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { Metadata, ResolvingMetadata } from "next";
import { AppInstallDialog } from "@/app/components/AppInstallDialog";
import { getLocale } from "@/utils/translate";
import { notFound } from "next/navigation";
import { TrackView } from "@/app/components/TrackView";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appVersion: string, os: string }>;
};

export default async function StudioDetail({params, searchParams}: Props) {
  const id = Number((await params).id);
  const {appVersion} = await searchParams

  if (isNaN(id) || !id) {
    notFound();
  }

  // 다이얼로그에 노출할 스튜디오 프로필 이미지 (웹에서만 사용)
  let profileImageUrl: string | undefined;
  if (appVersion === '') {
    const studio = await getStudioDetail(id);
    if (!isGuinnessErrorCase(studio)) profileImageUrl = studio.profileImageUrl;
  }

  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 폼, 그 외(앱 웹뷰/좁은 웹)는 기존 모바일 폼.
  // 둘 다 SSR 렌더 후 CSS로 토글 (수업 상세와 동일 패턴). getStudioDetail 중복 호출은 fetch 메모이제이션으로 1회.
  const isWeb = appVersion == '';
  return (
    <div className={'flex flex-col'}>
      <TrackView event="enter_studio" props={{studioId: id}}/>
      {isWeb ? (
        <>
          <div className="hidden lg:block">
            <StudioDetailPcForm id={id} appVersion={appVersion}/>
          </div>
          <div className="lg:hidden">
            {/* 앱 설치 유도는 모바일 웹에서만 — PC엔 무의미 */}
            <AppInstallDialog locale={await getLocale()} profileImageUrl={profileImageUrl}/>
            <StudioDetailForm id={id} appVersion={appVersion}/>
          </div>
        </>
      ) : (
        <StudioDetailForm id={id} appVersion={appVersion}/>
      )}
    </div>

  )
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const studioId = Number((await params).id);

  if (isNaN(studioId)) {
    return {
      title: 'Invalid Studio',
    };
  }

  try {
    const studioData = await getStudioDetail(studioId);

    if (isGuinnessErrorCase(studioData)) {
      return {
        title: 'Error',
        description: studioData.message,
      };
    }

    const images = [
      {
        url: studioData.profileImageUrl || '/default-studio-image.jpg',
        width: 1200,
        height: 630,
        alt: studioData.name,
      }
    ];

    return {
      title: studioData.name,
      description: studioData.businessName,
      openGraph: {
        title: studioData.name,
        description: studioData.businessName,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: studioData.name,
        description: studioData.businessName,
        images,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Studio',
      description: 'Studio details',
    };
  }
}