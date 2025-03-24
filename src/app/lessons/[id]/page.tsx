import { api } from "@/app/api.client";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import LessonDetailForm from "@/app/lessons/[id]/payment/LessonDetailForm";
import { getLessonDetailAction } from "@/app/lessons/[id]/action/getLessonDetailAction";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
}

export default async function LessonDetailPage({ params }: Props) {
  const lessonId = Number((await params).id);

  if (isNaN(lessonId)) {
    notFound();
  }

  const res = await getLessonDetailAction({ lessonId });

  if (isGuinnessErrorCase(res)) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">
          {res.message} (Error: {res.code})
        </p>
      </div>
    );
  }

  return <LessonDetailForm lesson={res} />;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const lessonId = Number((await params).id);

  if (isNaN(lessonId)) {
    return {
      title: 'Invalid Lesson',
    };
  }

  const res = await getLessonDetailAction({ lessonId });

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