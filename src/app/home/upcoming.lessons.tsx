'use client';
import { Poster } from "@/app/components/Poster";
import { LessonResponse } from "@/app/endpoint/studio.endpoint";
import { useEffect, useState } from "react";
import { getNewNotifications } from "@/app/home/new.notifications.action";
import { getUpcomingLessons } from "@/app/home/upcoming.lessons.action";

export const UpcomingLessons = () => {

  const [lessons, setLessons] = useState<any>(undefined);

  useEffect(() => {
    const fetchUpcomingLessons = async () => {
      try {
        const res = await getUpcomingLessons()
        if ('lessons' in res) {
          setLessons(res.lessons)
        }
      } catch (error) {
        setLessons([])
        console.error('스튜디오 정보를 불러오는데 실패했습니다:', error)
      }
    }
    if (!lessons) {
      fetchUpcomingLessons()
    }
  }, [])

  return (
    <>
      {lessons && lessons.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
          {lessons.map((item: LessonResponse) => (
            <div
              key={item.id}
              className="min-w-[calc(100vw-32px)] snap-start pl-4"
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
    </>
  );
}

