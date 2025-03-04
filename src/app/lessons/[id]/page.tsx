import { api } from "@/app/api.client";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import LessonDetailForm from "@/app/lessons/[id]/payment/LessonDetailForm";

export default async function LessonDetailPage({params}: { params: Promise<{ id: string }> }) {
  const res = await api.lesson.get({id: Number((await params).id)});
  if (isGuinnessErrorCase(res)) {
    return (
      <div>{res.code} {res.message}</div>
    )
  }
  return <LessonDetailForm lesson={res}/>
}