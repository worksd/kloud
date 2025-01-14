import { api } from "@/app/api.client";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import { mockLessons } from "@/app/home/mock.lessons";
import { StudioItems } from "@/app/search/StudioItems";

export default async function Search() {

  const res = await getStudioList()

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        <StudioItems studios={res.studios?.slice(0,5) ?? []}/>
        <LessonGridSection title={"인기 수업"} lessons={mockLessons}/>
      </div>
    </div>
  )
}

export async function getStudioList(): Promise<GetStudioResult> {
  const res = await api.studio.list({});

  if ('studios' in res) {
    return {
      studios: res.studios
    }
  } else {
    return {
      errorMessage: res.message,
    }
  }
}

export interface GetStudioResult {
  errorMessage?: string,
  studios?: GetStudioResponse[],
}