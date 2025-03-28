import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import { api } from "@/app/api.client";
import { Props } from "@/app/studios/[id]/page";

export default async function StudioLessons({params}: Props) {
  const { id } = await params
  const res = await api.lesson.listStudioLessons({studioId: id})
  if ('lessons' in res) {
    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader titleResource="popular_lesson"/>
        </div>
        <LessonGridItems lessons={'lessons' in res ? res.lessons : []}/>
      </div>
    )
  } else {
    return <div className={"text-black"}>Hello WOrld</div>
  }
}
