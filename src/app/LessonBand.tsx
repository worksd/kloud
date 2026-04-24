import { BandType, GetBandLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import React from "react";
import { RecommendPoster } from "@/app/components/RecommendPoster";

const calcDday = (startDate?: string): string | undefined => {
  if (!startDate) return undefined;
  const target = new Date(startDate.replace(' ', 'T'));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return undefined;
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
};

export async function LessonBand({title, lessons, type}: {
  title: string,
  lessons: GetBandLessonResponse[],
  type: BandType
}) {

  if (lessons.length == 0) return;

  return (
    <div className="flex flex-col mb-2">
      <h2 className="text-[18px] text-black font-bold pt-5 pb-2 px-6">{title}</h2>
      <div className="flex overflow-x-auto scrollbar-hide gap-2">
        {lessons.map((item: GetBandLessonResponse, index: number) => (
          <div
            key={item.id}
            className={index === 0 ? 'pl-5' : index === lessons.length - 1 ? 'pr-5' : ''}
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
                label={{ dday: calcDday(item.startDate) }}
              />
            }
          </div>
        ))}
      </div>
    </div>
  );
};
