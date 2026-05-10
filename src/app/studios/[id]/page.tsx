import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { StudioDesktopForm } from "@/app/studios/[id]/StudioDesktopForm";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { GetTimeTableResponse } from "@/app/endpoint/studio.endpoint";
import { Metadata, ResolvingMetadata } from "next";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { KloudScreen } from "@/shared/kloud.screen";
import { notFound } from "next/navigation";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appVersion: string, os: string }>;
};

export default async function StudioDetail({params, searchParams}: Props) {
  const id = Number((await params).id);
  const {appVersion, os} = await searchParams

  if (isNaN(id) || !id) {
    notFound();
  }

  // 네이티브 앱이 아닌 일반 브라우저(=Web) 진입 시엔 데스크톱 전용 페이지 노출.
  // proxy.ts가 UA에 KloudNativeClient 토큰이 없으면 appVersion=''로 세팅 + os는 Android/iOS 외 값.
  if (appVersion === '' && os !== 'Android' && os !== 'iOS') {
    const studio = await getStudioDetail(id);
    if (!('id' in studio)) notFound();
    const tt = await getTimeTableAction({ studioId: id });
    const timeTable: GetTimeTableResponse | null = 'cells' in tt ? tt : null;
    return <StudioDesktopForm studio={studio} timeTable={timeTable}/>;
  }

  return (
    <div className={'flex flex-col'}>
      {appVersion == '' && <MobileWebViewTopBar
        os={os}
        isLogin={(await cookies()).get(accessTokenKey)?.value != undefined}
        returnUrl={KloudScreen.StudioDetail(id)}
      />}
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