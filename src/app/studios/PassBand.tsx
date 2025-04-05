'use client'

import React from "react";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PassRowList } from "@/app/studios/PassRowList";

export const PassBand = ({title, passes}: { title: string, passes: GetPassResponse[] }) => {
  return (
    <section className="flex flex-col">
      <h2 className="text-[20px] text-black font-bold mb-4 mx-4">{title}</h2>
      <PassRowList passes={passes ?? []}/>
    </section>
  )
}