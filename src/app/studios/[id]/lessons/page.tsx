import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { api } from "@/app/api.client";
import { Props } from "@/app/studios/[id]/page";
import { ClientLessonGridItems } from "@/app/studios/[id]/lessons/ClientLessonGridItems";
import { getStudioLessonList } from "@/app/studios/[id]/lessons/get.studio.lesson.list.action";

export default async function StudioLessons({params}: Props) {
  const {id} = await params
  const res = await getStudioLessonList({studioId: id, page: 1})
  if ('lessons' in res) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="popular_lesson"/>
        </div>
        <ClientLessonGridItems lessons={res.lessons} studioId={id}/>
      </div>
    )
  } else {
    return <div className={"text-black"}>{res.message}</div>
  }
}
