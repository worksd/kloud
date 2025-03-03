import React, { useEffect, useState } from "react";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { StudioArrowItem } from "@/app/pass/StudioArrowItem";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export const PassSelectStudio = ({onClickAction} : {onClickAction: (studio: GetStudioResponse) => void}) => {

  const [studios, setStudios] = useState<GetStudioResponse[]>([])

  useEffect(() => {
    const fetchStudios = async () => {
      const res = await getStudioList();
      setStudios(res.studios ?? []);
    }
    fetchStudios()
  }, []);

  return (
    <div className={"flex flex-col"}>
      {/* 백 헤더 */}

      <div className={"text-black text-[24px] font-medium px-6 mb-10"}>
        패스를 구매할 스튜디오를 선택해 주세요
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