'use client'

import React from "react";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { PassRowList } from "@/app/studios/PassRowList";
import { Locale } from "@/shared/StringResource";

export const PassBand = ({title, passes, locale}: { title: string, passes: GetPassResponse[], locale: Locale }) => {
  return (
    <section className="flex flex-col">
      <h2 className="text-[20px] text-black font-bold mb-4 mx-4">{title}</h2>
      <PassRowList passes={passes ?? []} locale={locale}/>
    </section>
  )
}