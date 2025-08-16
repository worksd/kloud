import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { GetBandResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonBandList = ({bands}: { bands: GetBandResponse[] }) => {

  return (
    <div className={'flex flex-col mt-10'}>
      {
        bands.map((value) => (
          <LessonBand
            key={value.title}
            title={value.title}
            lessons={value.lessons}
            type={value.type}
          />
        ))
      }
    </div>
  )
}