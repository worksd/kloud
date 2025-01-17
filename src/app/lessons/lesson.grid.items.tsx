import { Poster } from "@/app/components/Poster";
import { formatDateTime } from "@/app/lessons/[id]/lesson.info.section";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonGridItems = ({lessons} : {lessons: GetLessonResponse[]}) => {
  console.log(lessons);
  return (
    <div className="grid grid-cols-2 gap-2">
      {lessons.map((lesson) => (
        <Poster
          key={lesson.id}
          id={lesson.id}
          posterUrl={lesson.thumbnailUrl ?? lesson.artist.profileImageUrl}
          studioLogoUrl={lesson.studio ? lesson.studio.profileImageUrl : ''}
          title={lesson.title}
          startTime={lesson.startTime}
        />
      ))}
    </div>
  )
}