import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { LessonGridItems } from "@/app/lessons/lesson.grid.items";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export default async function Lessons() {
  // TODO: 하드코딩 수정
  const lessons: GetLessonResponse[] = []
  return (
    <div className="w-full h-screen bg-whiteflex flex-col">
      {/* 백 헤더 (컴포넌트로 따로 빼네야 함) */}
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="원밀리언 댄스 스튜디오"/>
      </div>
      <div className={"px-6"}>
        <LessonGridItems lessons={lessons}/>
      </div>

    </div>
  )
}
