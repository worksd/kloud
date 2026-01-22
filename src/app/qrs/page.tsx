import { api } from "@/app/api.client";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import dynamic from 'next/dynamic';

const QRPageContent = dynamic(() => import('./QRPageContent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div className="qr-loading-spinner" />
    </div>
  ),
});

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

  return <QRPageContent lesson={lesson} lessonId={lessonId} />;
}
