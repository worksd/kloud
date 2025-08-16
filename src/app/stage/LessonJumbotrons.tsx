import { getJumbotronList } from "@/app/home/action/get.jumbotron.list";
import CardList from "@/app/components/Carousel";
import React from "react";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonJumbotrons = ({lessons} : {lessons: GetLessonResponse[]}) => {
  return (
    <section className="flex flex-col">
      <CardList lessons={lessons}/>
    </section>
  )
}

