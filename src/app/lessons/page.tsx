import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LessonGridItems } from "@/app/lessons/lesson.grid.items";
import { api } from "@/app/api.client";

export default async function Lessons() {
  const res = await api.lesson.listPopular({})
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
}
