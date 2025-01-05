import { LessonResponse } from "@/app/endpoint/studio.endpoint";
import { Poster } from "@/app/components/Poster";
import { formatDateTime } from "@/app/lessons/[id]/lesson.info.section";

export const LessonGridItems = ({lessons} : {lessons: LessonResponse[]}) => {
  console.log(lessons);
  return (
    <div className="grid grid-cols-2 gap-4">
      {lessons.map((lesson) => (
        <Poster
          key={lesson.id}
          id={lesson.id}
          posterUrl={lesson.thumbnailUrl}
          studioLogoUrl={lesson.studio ? lesson.studio.profileImageUrl : ''}
          title={lesson.title}
          startTime={lesson.startTime}
        />
      ))}
    </div>
  )
}