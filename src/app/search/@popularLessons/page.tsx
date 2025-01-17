import { StudioItems } from "@/app/search/StudioItems";
import { api } from "@/app/api.client";
import { LessonGridSection } from "@/app/components/lesson.grid.section";

export default async function PopularLessons() {
  const res = await getPopularLessons()
  return (
    <LessonGridSection title={"인기 수업"} lessons={res.lessons?.slice(0,4) ?? []}/>
  )
}

async function getPopularLessons() {
  const res = await api.lesson.listPopular({});

  if ('lessons' in res) {
    return {
      lessons: res.lessons
    }
  } else {
    return {
      errorMessage: res.message,
    }
  }
}

