import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import QRPageContent from './QRPageContent';
import { getMeAction } from "@/app/kiosk/get.me.action";

type Props = {
  searchParams: Promise<{ lessonId?: string }>;
};

export default async function QRPage({ searchParams }: Props) {
  const { lessonId } = await searchParams;

  let lesson: GetLessonResponse | null = null;
  let studioId: number | null = null;

  if (lessonId) {
    try {
      const res = await api.lesson.get({ id: Number(lessonId) });
      if ('id' in res) {
        lesson = res;
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    }
  }

  // lessonId 로 들어온 경우에도 studioId 는 항상 채운다 — 스캔 화면에서 다른 수업으로 바꿀 수 있어야 한다.
  try {
    const me = await getMeAction();
    if ('id' in me && me.studio?.id) {
      studioId = me.studio.id;
    }
  } catch { /* not an operator/partner */ }

  return <QRPageContent lesson={lesson} studioId={studioId} />;
}
