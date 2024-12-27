import { Lesson } from "@/entities/lesson/lesson";
import { Poster } from "@/app/components/Poster";

export const UpcomingLessons = ({lessons} : {lessons: Lesson[]}) => {

  return (
    <div>
      <div className="headline-200 text-left p-2">
        Upcoming
      </div>

      <ul className="flex flex-row space-x-4 p-2">
        {lessons.map((item) => (
          <Poster key={item.id} id={item.id} posterUrl={item.posterUrl} title={item.title} description={item.date} dDay={item.date}
                  studioLogoUrl={item.studio.logoUrl}/>
        ))}
      </ul>
    </div>
  )
}

