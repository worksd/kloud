import { Poster } from "@/app/components/Poster";
import { LessonResponse } from "@/app/endpoint/studio.endpoint";

export const UpcomingLessons = ({lessons}: { lessons: LessonResponse[] }) => {

  return (
    <div className="flex flex-row space-x-4 px-4 overflow-x-auto scrollbar-hide">
      {lessons.map((item) => (
        <Poster key ={item.id} id={item.id} posterUrl={item.thumbnailUrl} title={item.title}
                startTime={item.startTime}
                studioLogoUrl={item.studio.profileImageUrl}/>
      ))}
    </div>
  )
}

