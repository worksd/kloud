import { BandType, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import React from "react";
import { RecommendPoster } from "@/app/components/RecommendPoster";


export async function LessonBand({title, lessons, type}: {
  title: string,
  lessons: GetLessonResponse[],
  type: BandType
}) {

  if (lessons.length == 0) return;

  return (
    <div className="flex flex-col mb-6">
      <h2 className="text-[20px] text-black font-bold mb-4 px-4">{title}</h2>
      <div className="flex overflow-x-auto scrollbar-hide space-x-4">
        {lessons.map((item: GetLessonResponse, index: number) => (
          <div
            key={item.id}
            className={index === 0 ? 'pl-4' : ''}
          >
            {type == 'Default' &&
              <Poster
                width={167}
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                title={item.title}
                startTime={item.startTime ?? ''}
                studio={item.studio}
                dday={item.dday}
                genre={item.genre}
                type={item.type}
              />
            }
            {
              type == 'Recommendation' &&
              <RecommendPoster
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                startTime={item.startTime ?? ''}
                title={item.title ?? ''}
              />
            }
          </div>
        ))}
        <div className="pr-4"/>
        {/* 마지막 여백 */}
      </div>
    </div>
  );
};