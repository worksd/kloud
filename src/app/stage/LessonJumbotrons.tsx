import CardList from "@/app/components/Carousel";
import React from "react";
import { GetLessonResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonJumbotrons = ({lessons} : {lessons: JumbotronResponse[]}) => {
  return (
    <section className="flex flex-col">
      <CardList lessons={lessons}/>
    </section>
  )
}

