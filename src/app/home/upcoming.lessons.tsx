import { Lesson } from "@/entities/lesson/lesson";
import { Poster } from "@/app/components/Poster";

export const UpcomingLessons = ({lessons} : {lessons: Lesson[]}) => {

  return (
    <div>

      <ul className="flex flex-row space-x-4 p-2">
        {lessons.map((item) => (
          <Poster id={item.id} posterUrl={item.posterUrl} title={item.title} description={item.date} dDay={item.date}
                  studioLogoUrl={item.studio.logoUrl}/>
        ))}
      </ul>
    </div>
  )
}

