import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { Metadata, ResolvingMetadata } from "next";
import { AppInstallDialog } from "@/app/components/AppInstallDialog";
import { getLocale } from "@/utils/translate";
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

  // 다이얼로그에 노출할 스튜디오 프로필 이미지 (웹에서만 사용)
  let profileImageUrl: string | undefined;
  if (appVersion === '') {
    const studio = await getStudioDetail(id);
    if (!isGuinnessErrorCase(studio)) profileImageUrl = studio.profileImageUrl;
  }

  return (
    <div className={'flex flex-col'}>
      {/* 웹 진입 시 앱 설치 유도 다이얼로그 (기존 상단바 대체) */}
      {appVersion == '' && <AppInstallDialog locale={await getLocale()} profileImageUrl={profileImageUrl}/>}
      <StudioDetailForm id={id} appVersion={appVersion}/>
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