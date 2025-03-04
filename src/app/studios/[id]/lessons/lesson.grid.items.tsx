'use server'
import { Poster } from "@/app/components/Poster";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonGridItems = async ({lessons} : {lessons: GetLessonResponse[]}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {lessons.map((lesson) => (
        <Poster
          key={lesson.id}
          id={lesson.id}
          posterUrl={lesson.thumbnailUrl ?? lesson.artist?.profileImageUrl ?? ''}
          studioLogoUrl={lesson.studio?.profileImageUrl ? lesson.studio.profileImageUrl : ''}
          title={lesson.title ?? ''}
          startTime={lesson.startTime ?? ''}
        />
      ))}
    </div>
  )
}