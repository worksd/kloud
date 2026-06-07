import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { StudioDetailPcForm } from "@/app/studios/[id]/StudioDetailPcForm";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

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

  // 웹 + 1024px+: PC 폼. 그 외(앱 웹뷰 / 좁은 웹): 기존 모바일 폼.
  // top bar (로고/메뉴)는 layout의 WebTopNav가 글로벌 처리.
  const isWeb = appVersion == '';

  return (
    <div className={'flex flex-col'}>
      {isWeb ? (
        <>
          <div className="hidden lg:block">
            <StudioDetailPcForm id={id} appVersion={appVersion}/>
          </div>
          <div className="lg:hidden">
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
