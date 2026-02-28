import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import QRPageContent from './QRPageContent';
import { getMeAction } from "@/app/profile/setting/kiosk/get.me.action";

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

  if (!lesson) {
    try {
      const me = await getMeAction();
      if ('id' in me && me.studio?.id) {
        studioId = me.studio.id;
      }
    } catch { /* not an operator/partner */ }
  }

  return <QRPageContent lesson={lesson} studioId={studioId} />;
}
