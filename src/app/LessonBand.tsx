import { BandLabel, BandType, GetBandLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import React from "react";
import { RecommendPoster } from "@/app/components/RecommendPoster";
import ComingLabel from "../../public/assets/ic_label_comming.svg";
import NewLabel from "../../public/assets/new.svg";

export async function LessonBand({title, lessons, type, label}: {
  title: string,
  lessons: GetBandLessonResponse[],
  type: BandType,
  label?: BandLabel,
}) {

  if (lessons.length == 0) return;

  return (
    <div className="flex flex-col mb-2">
      {label?.coming && (
        <div className="px-6 pt-3">
          <ComingLabel className="h-[16px] w-auto" />
        </div>
      )}
      {label?.new && (
        <div className="px-6 pt-3">
          <NewLabel className="h-[16px] w-auto" />
        </div>
      )}
      <h2 className={`text-[18px] text-black font-bold leading-tight ${(label?.coming || label?.new) ? 'pt-[4px]' : 'pt-5'} pb-2 px-6`}>{title}</h2>
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
                tags={item.label?.tags ?? undefined}
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
      </div>
    </div>
  );
};
