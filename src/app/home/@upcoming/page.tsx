import { LessonResponse } from "@/app/endpoint/studio.endpoint";
import { Poster } from "@/app/components/Poster";
import { mockLessons } from "@/app/home/mock.lessons";

export default async function Upcoming() {
  const lessons = mockLessons;
  return (
    <div>
      <div className="p-4">
        <div className="text-[24px] font-normal text-black">Upcoming</div>
      </div>
      {lessons && lessons.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
          {lessons.map((item: LessonResponse) => (
            <div
              key={item.id}
              className="pl-4"
            >
              <Poster
                width={167}
                id={item.id}
                posterUrl={item.thumbnailUrl}
                title={item.title}
                startTime={item.startTime}
                studioLogoUrl={item.studio.profileImageUrl}
              />
            </div>
          ))}
        </div>
      )}
      {lessons && lessons.length == 0 && (
        <div className="w-screen text-center text-[#BCBFC2] py-[150px]">다가오는 수업이 없습니다</div>
      )}
    </div>
  )
}