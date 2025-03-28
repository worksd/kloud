import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { Metadata, ResolvingMetadata } from "next";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { KloudScreen } from "@/shared/kloud.screen";

export type Props = {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ appVersion: string, os: string }>;
};

export default async function StudioDetail({params, searchParams}: Props) {
  const {id} = (await params);
  const {appVersion, os} = await searchParams
  return (
    <div className={'flex flex-col'}>
      {appVersion == '' && <MobileWebViewTopBar
        os={os}
        isLogin={(await cookies()).get(accessTokenKey)?.value != undefined}
        returnUrl={KloudScreen.StudioDetail(id)}
      />}
      <StudioDetailForm id={id}/>
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