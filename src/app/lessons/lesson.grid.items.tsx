import { LessonResponse } from "@/app/endpoint/studio.endpoint";
import { Poster } from "@/app/components/Poster";

export const LessonGridItems = ({lessons} : {lessons: LessonResponse[]}) => {

  return (
    <div className="grid grid-cols-2 gap-4">
      {lessons.map((lesson) => (
        <Poster
          key={lesson.id}
          id={lesson.id}
          posterUrl={lesson.thumbnailUrl}
          studioLogoUrl={"https://picsum.photos/250/250"}
          title={lesson.title}
          description={lesson.startTime}
          dDay={lesson.startTime}
        />
      ))}
    </div>
  )
}