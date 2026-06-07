import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import LessonDetailForm from "@/app/lessons/[id]/payment/LessonDetailForm";
import LessonDetailPcForm from "@/app/lessons/[id]/payment/LessonDetailPcForm";
import { getLessonDetailAction } from "@/app/lessons/[id]/action/getLessonDetailAction";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
}

export default async function LessonDetailPage({params, searchParams}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { appVersion } = await searchParams
  const lessonId = Number((await params).id);

  if (isNaN(lessonId)) {
    notFound();
  }

  const res = await getLessonDetailAction({lessonId});

  if (isGuinnessErrorCase(res)) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">
          {res.message} (Error: {res.code})
        </p>
      </div>
    );
  }

  // appVersion === '' (= 웹 직접 접근) + viewport ≥1024px(lg)일 때만 PC 폼.
  // 그 외 (앱 웹뷰 / 좁은 웹) 는 기존 모바일 폼. 둘 다 SSR 렌더 후 CSS로 토글.
  // 웹 top bar (로고/메뉴/로그인)는 layout의 WebTopNav가 글로벌 처리.
  const isWeb = appVersion == '';
  return (
    <div>
      {isWeb ? (
        <>
          <div className="hidden lg:block">
            <LessonDetailPcForm lesson={res} appVersion={appVersion}/>
          </div>
          <div className="lg:hidden">
            <LessonDetailForm lesson={res} appVersion={appVersion}/>
          </div>
        </>
      ) : (
        <LessonDetailForm lesson={res} appVersion={appVersion}/>
      )}
    </div>

  )
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const lessonId = Number((await params).id);

  if (isNaN(lessonId)) {
    return {
      title: 'Invalid Lesson',
    };
  }

  const res = await getLessonDetailAction({lessonId});

  if (isGuinnessErrorCase(res)) {
    return {
      title: 'Error',
      description: res.message,
    };
  }

  const images = [
    {
      url: res.thumbnailUrl || '/default-studio-image.jpg',
      width: 1200,
      height: 630,
      alt: 'thumbnail',
    }
  ];

  return {
    title: res.title,
    description: `Lesson ${res.id}: ${res.title}`,
    openGraph: {
      title: res.title,
      description: `Lesson ${res.id}: ${res.title}`,
      images
    },
  };
}