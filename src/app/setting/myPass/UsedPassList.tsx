'use client'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

export const UsedPassList = ({passItems} : { passItems: GetPassResponse[]}) => {
  return (
    <div className={"flex flex-col text-black"}>
      Used Pass List
    </div>
  )
}