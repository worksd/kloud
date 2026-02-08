import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { MobileWebViewTopBar } from "@/app/components/MobileWebViewTopBar";
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { KloudScreen } from "@/shared/kloud.screen";
import { getLessonGroupDetailAction } from "./getLessonGroupDetailAction";
import { getLessonGroupLessonsAction } from "./getLessonGroupLessonsAction";
import LessonGroupDetailForm from "./LessonGroupDetailForm";
import { getLocale } from "@/utils/translate";

type Props = {
  params: Promise<{ id: string }>
}

export default async function LessonGroupDetailPage({params, searchParams}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ os: string, appVersion: string }>
}) {
  const { os, appVersion } = await searchParams;
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [lessonGroupRes, lessonsRes] = await Promise.all([
    getLessonGroupDetailAction({id}),
    getLessonGroupLessonsAction({id, year: currentYear, month: currentMonth}),
  ]);

  if (isGuinnessErrorCase(lessonGroupRes)) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">
          {lessonGroupRes.message} (Error: {lessonGroupRes.code})
        </p>
      </div>
    );
  }

  const initialLessons = isGuinnessErrorCase(lessonsRes) ? [] : lessonsRes.lessons;
  const locale = await getLocale();

  return (
    <div>
      {appVersion === '' && <MobileWebViewTopBar
        os={os}
        isLogin={(await cookies()).get(accessTokenKey)?.value !== undefined}
        returnUrl={KloudScreen.LessonGroupDetail(id)}
      />}
      <LessonGroupDetailForm
        lessonGroup={lessonGroupRes}
        initialLessons={initialLessons}
        locale={locale}
        appVersion={appVersion ?? ''}
      />
    </div>
  );
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = Number((await params).id);

  if (isNaN(id)) {
    return {
      title: 'Invalid Lesson Group',
    };
  }

  const res = await getLessonGroupDetailAction({id});

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
    description: `정기수업: ${res.title}`,
    openGraph: {
      title: res.title,
      description: `정기수업: ${res.title}`,
      images
    },
  };
}
