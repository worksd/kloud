'use client'
import React, { useEffect, useState } from "react";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { StudioArrowItem } from "@/app/passPlans/StudioArrowItem";
import { TranslatableText } from "@/utils/TranslatableText";

export const PassSelectStudio = ({studios, onClickAction}: {
  studios: GetStudioResponse[],
  onClickAction: (studio: GetStudioResponse) => void
}) => {

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])

  if (!mounted) return;

  return (
    <div className={"flex flex-col w-full overflow-x-hidden"}>
      <div className={"text-black text-[24px] font-medium px-6 mb-10"}>
        <TranslatableText titleResource={'select_purchase_pass_plan_studio'}/>
      </div>
      <ul className="flex flex-col">
        {studios.map((item) => (
          <StudioArrowItem key={item.id} item={item} onClickAction={(studio: GetStudioResponse) => {
            onClickAction(studio)
          }}/>
        ))}
      </ul>
    </div>

  )
}