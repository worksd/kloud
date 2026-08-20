import { notFound } from "next/navigation";
import { getLocale } from "@/utils/translate";
import { api } from "@/app/api.client";
import { InviteStudentsForm, InviteLessonSummary } from "@/app/privateLessons/[id]/invite/InviteStudentsForm";

// 개인수업 수강생 등록 — 강사 전용. studioId는 강사 경로 API들에 필수라 쿼리로 받는다.
export default async function PrivateLessonInvitePage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ studioId?: string }>,
}) {
  const lessonId = Number((await params).id);
  const studioId = Number((await searchParams).studioId);

  if (isNaN(lessonId) || isNaN(studioId)) notFound();

  // 어떤 수업에 등록하는지 상단 요약 카드용 — 실패해도 등록 플로우는 살린다(요약만 생략)
  const [lessonRes, locale] = await Promise.all([
    api.lesson.get({ id: lessonId }),
    getLocale(),
  ]);
  const lesson: InviteLessonSummary | null = 'id' in lessonRes
    ? {
        title: lessonRes.title ?? '',
        thumbnailUrl: lessonRes.thumbnailUrl,
        date: lessonRes.date,
        studioName: lessonRes.studio?.name,
        roomName: lessonRes.room?.name,
      }
    : null;

  return <InviteStudentsForm lessonId={lessonId} studioId={studioId} lesson={lesson} locale={locale}/>;
}
