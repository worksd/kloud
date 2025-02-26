import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import { api } from "@/app/api.client";
import { Props } from "@/app/studios/[id]/page";

export default async function StudioLessons({params}: Props) {
  const res = await api.lesson.listStudioLessons({studioId: (await params).id})
  if ('lessons' in res) {
    return (
      <div className="w-full h-screen bg-whiteflex flex-col">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title="인기 수업"/>
        </div>
        <div className={"px-6"}>
          <LessonGridItems lessons={'lessons' in res ? res.lessons : []}/>
        </div>

      </div>
    )
  } else {
    return <div className={"text-black"}>Hello WOrld</div>
  }
}
