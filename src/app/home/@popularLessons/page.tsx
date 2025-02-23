import { StudioItems } from "@/app/search/StudioItems";
import { api } from "@/app/api.client";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import { getJumbotronList } from "@/app/home/action/get.jumbotron.list";

export default async function PopularLessons() {
  const res = await getJumbotronList()
  return (
    <LessonGridSection title={"인기 수업"} lessons={res.lessons?.slice(0,4) ?? []}/>
  )
}

