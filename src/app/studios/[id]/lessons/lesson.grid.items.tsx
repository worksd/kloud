'use server'
import { Poster } from "@/app/components/Poster";
import { GetBandLessonResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonGridItems = async ({ lessons }: { lessons: GetBandLessonResponse[] }) => {
  return (
    <div className="w-full px-4 flex justify-center"> {/* 컨테이너 추가 */}
      <div className="grid grid-cols-2 gap-3 w-full"> {/* 최대 너비 제한 */}
        {lessons.map((lesson) => (
          <Poster
            key={lesson.id}
            id={lesson.id}
            posterUrl={lesson.thumbnailUrl}
            title={lesson.title ?? ''}
            description={lesson.description ?? ''}
            width={undefined}
            label={lesson.label}
          />
        ))}
      </div>
    </div>
  )
}