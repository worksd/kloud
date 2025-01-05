import { Poster } from "@/app/components/Poster";
import { LessonResponse } from "@/app/endpoint/studio.endpoint";

export const UpcomingLessons = ({lessons} : {lessons: LessonResponse[]}) => {

  return (
    <div>

      <ul className="flex flex-row space-x-4 px-4">
        {lessons.map((item) => (
          <Poster id={item.id} posterUrl={item.thumbnailUrl} title={item.title} description={item.startTime} dDay={item.startTime}
                  studioLogoUrl={item.studio.profileImageUrl}/>
        ))}
      </ul>
    </div>
  )
}

