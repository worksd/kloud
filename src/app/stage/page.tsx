'use server'

import { api } from "@/app/api.client";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";
import { LessonJumbotrons } from "@/app/stage/LessonJumbotrons";
import { LessonBandList } from "@/app/stage/LessonBandList";
import { StudioItems } from "@/app/search/StudioItems";

export default async function StagePage() {
  const res = await api.home.getStage({})

  if ('jumbotrons' in res) {
    return (
      <div className={'flex flex-col'}>
        <LessonJumbotrons lessons={res.jumbotrons}/>
        <LessonBandList bands={res.bands}/>
        <StudioItems studios={res.studios ?? []}/>
      </div>
    )
  }

}