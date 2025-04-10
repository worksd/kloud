import { LessonBand } from "@/app/LessonBand";
import React from "react";
import { api } from "@/app/api.client";

export default async function HomeBand() {
  const res = await api.lesson.listStageBands({})
  if ('bands' in res) {
    return (
      <div className={'flex flex-col mt-10'}>
        {
          res.bands.map((value) => (
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
}