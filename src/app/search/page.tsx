import Logo from "../../../public/assets/logo_black.svg";
import { SearchStudioItems } from "@/app/search/simple.studio.item";
import { api } from "@/app/api.client";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { UserStatus } from "@/entities/user/user.status";
import { TopToolbar } from "@/shared/top.toolbar";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import { mockLessons } from "@/app/home/mock.lessons";

export default async function Search() {

  const res = await getStudioList()

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <TopToolbar title="검색"/>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        <SearchStudioItems studios={res.studios ?? []}/>
        <LessonGridSection title={"인기 수업"} lessons={mockLessons}/>
      </div>
    </div>
  )
}

async function getStudioList(): Promise<GetStudioResult> {
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