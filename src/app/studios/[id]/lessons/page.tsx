import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Props } from "@/app/studios/[id]/page";
import { getStudioOngoingLessons } from "@/app/studios/[id]/lessons/get.studio.lesson.list.action";
import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";

export default async function StudioLessons({params}: Props) {
  const {id} = await params
  const res = await getStudioOngoingLessons({studioId: id, page: 1, all: true})
  if ('lessons' in res) {
    return (
      <div className="flex flex-col w-full">
        <LessonGridItems lessons={res.lessons}/>
      </div>
    )
  } else {
    return <div className={"text-black"}>{res.message}</div>
  }
}
