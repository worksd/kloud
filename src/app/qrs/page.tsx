import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import QRPageContent from './QRPageContent';

type Props = {
  searchParams: Promise<{ lessonId?: string }>;
};

export default async function QRPage({ searchParams }: Props) {
  const { lessonId } = await searchParams;

  let lesson: GetLessonResponse | null = null;

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

  return <QRPageContent lesson={lesson} />;
}
