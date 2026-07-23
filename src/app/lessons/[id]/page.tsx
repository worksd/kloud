import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import LessonDetailForm from "@/app/lessons/[id]/payment/LessonDetailForm";
import { getLessonDetailAction } from "@/app/lessons/[id]/action/getLessonDetailAction";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { AppInstallDialog } from "@/app/components/AppInstallDialog";
import { getLocale } from "@/utils/translate";
import { LessonViewTracker } from "@/app/lessons/[id]/LessonViewTracker";

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

  return (
    <div>
      {/* 조회수 트래킹 — 진입 시 1회 POST /tracking-events (5분 디바운스). 앱/웹 공통. */}
      <LessonViewTracker lessonId={lessonId}/>
      {/* 웹 진입 시 앱 설치 유도 다이얼로그 (기존 상단바 대체) */}
      {appVersion == '' && <AppInstallDialog locale={await getLocale()}/>}
      <LessonDetailForm lesson={res} appVersion={appVersion}/>
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