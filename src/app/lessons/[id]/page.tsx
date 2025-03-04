import { Metadata } from "next";
import { api } from "@/app/api.client";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { LessonDetailForm } from "@/app/lessons/[id]/payment/LessonDetailForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const data = await api.lesson.get({id: Number((await params).id)});
  if (isGuinnessErrorCase(data)) {
    return {
      title: 'no data'
    }
  } else {
    return {
      title: data.title,
    };
  }
}

export default async function LessonDetail({params}: Props) {
  const id = Number((await params).id);

  const lesson = await api.lesson.get({id});
  if (isGuinnessErrorCase(lesson)) {
    return (
      <div>{lesson.code} {lesson.message}</div>
    )
  } else {
    return <LessonDetailForm data={lesson}/>
  }


}