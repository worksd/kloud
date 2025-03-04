import { getJumbotronList } from "@/app/home/action/get.jumbotron.list";
import CardList from "@/app/components/Carousel";
import React from "react";

export default async function PopularLessons() {
  const res = await getJumbotronList()
  return (
    <section className="flex flex-col">
      <CardList lessons={res.lessons ?? []}/>
    </section>
  )
}

