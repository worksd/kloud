import { notFound } from "next/navigation";
import { getStudioBySlugAction } from "@/app/[handle]/get.studio.by.slug.action";
import { StudioDesktopForm } from "@/app/studios/[id]/StudioDesktopForm";
import { StudioDetailForm } from "@/app/studios/[id]/studio.detail";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { KloudScreen } from "@/shared/kloud.screen";
import { Metadata } from "next";
import { getTimeTableAction } from "@/app/studios/timetable/get.time.table.action";
import { GetTimeTableResponse } from "@/app/endpoint/studio.endpoint";

/**
 * /@slug 형태 vanity URL.
 *
 * Next.js 라우팅 메모: `app/[handle]/page.tsx`가 단일 세그먼트(/login, /home 등 정적 라우트가 아닌 모든 경로)를 받음.
 * 정적 라우트가 우선 매치되므로 /home, /login 같은 기존 페이지엔 영향 없음.
 * `@`로 시작하지 않는 임의 경로는 notFound()로 떨어뜨려서 무한정 매치되지 않게 가드.
 */

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ appVersion: string, os: string }>;
};

export default async function HandlePage({ params, searchParams }: Props) {
  const { handle: rawHandle } = await params;
  const { appVersion, os } = await searchParams;

  // Next.js가 path 세그먼트를 디코딩 안 하고 넘기는 경우가 있어 (예: '@' → '%40') 항상 디코드.
  const handle = decodeURIComponent(rawHandle);
  if (!handle.startsWith('@')) notFound();
  const slug = handle.slice(1);
  if (!slug) notFound();

  const studio = await getStudioBySlugAction(slug);
  if (!('id' in studio)) notFound();

  // 데스크톱 웹 진입 — 데스크톱 전용 폼. 시간표는 BE 실데이터로 함께 fetch.
  if (appVersion === '' && os !== 'Android' && os !== 'iOS') {
    const tt = await getTimeTableAction({ studioId: studio.id });
    const timeTable: GetTimeTableResponse | null = 'cells' in tt ? tt : null;
    return <StudioDesktopForm studio={studio} timeTable={timeTable}/>;
  }

  // 모바일 웹 / 네이티브 앱 — 기존 모바일 상세 페이지 재사용
  return (
    <div className={'flex flex-col'}>
      {appVersion == '' && <MobileWebViewTopBar
        os={os}
        isLogin={(await cookies()).get(accessTokenKey)?.value != undefined}
        returnUrl={KloudScreen.StudioDetail(studio.id)}
      />}
      <StudioDetailForm id={studio.id} appVersion={appVersion}/>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  if (!handle.startsWith('@')) return {};
  const slug = handle.slice(1);
  if (!slug) return {};

  try {
    const studio = await getStudioBySlugAction(slug);
    if (!('id' in studio)) return {};

    const images = [{
      url: studio.profileImageUrl || '/default-studio-image.jpg',
      width: 1200,
      height: 630,
      alt: studio.name,
    }];

    return {
      title: studio.name,
      description: studio.businessName,
      openGraph: {
        title: studio.name,
        description: studio.businessName,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: studio.name,
        description: studio.businessName,
        images,
      },
    };
  } catch {
    return {};
  }
}
