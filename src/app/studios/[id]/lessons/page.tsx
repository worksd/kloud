import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getStudioOngoingLessons } from "@/app/studios/[id]/lessons/get.studio.lesson.list.action";
import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudioLessons({params}: Props) {
  const id = Number((await params).id);

  if (isNaN(id) || !id) {
    notFound();
  }

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
