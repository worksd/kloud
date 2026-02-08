import { BandType, GetBandLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import React from "react";
import { RecommendPoster } from "@/app/components/RecommendPoster";


export async function LessonBand({title, lessons, type}: {
  title: string,
  lessons: GetBandLessonResponse[],
  type: BandType
}) {

  if (lessons.length == 0) return;

  return (
    <div className="flex flex-col mb-6">
      <h2 className="text-[20px] text-black font-bold mb-4 px-4">{title}</h2>
      <div className="flex overflow-x-auto scrollbar-hide space-x-4">
        {lessons.map((item: GetBandLessonResponse, index: number) => (
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
                description={item.description ?? ''}
                studioName={item.studioName}
                studioImageUrl={item.studioImageUrl}
                label={item.label}
                type={item.type}
              />
            }
            {
              type == 'Recommendation' &&
              <RecommendPoster
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                date={item.description ?? ''}
                title={item.title ?? ''}
                type={item.type}
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