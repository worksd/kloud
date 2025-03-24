import { api } from "@/app/api.client";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import LessonDetailForm from "@/app/lessons/[id]/payment/LessonDetailForm";
import { getLessonDetailAction } from "@/app/lessons/[id]/action/getLessonDetailAction";

export default async function LessonDetailPage({params}: { params: Promise<{ id: string }> }) {
  const res = await getLessonDetailAction({lessonId: Number((await params).id)})
  if (isGuinnessErrorCase(res)) {
    return (
      <div>{res.code} {res.message}</div>
    )
  }
  return <LessonDetailForm lesson={res}/>
}