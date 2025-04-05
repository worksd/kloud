import { api } from "@/app/api.client";
import React from "react";
import { StudioSheetItem } from "@/app/studios/setting/sheet/StudioSheetItem";

export default async function StudioSettingSheetPage() {
  const res = await api.studio.my({});

  if ('studios' in res) {
    return (
      <div>
        <header className="p-4 text-xl font-bold text-black ml-4 mt-4">
          나의 수강 스튜디오
        </header>

        {res.studios.map(async (studio) => (
          <StudioSheetItem item={studio} key={studio.id}/>
        ))}
      </div>
    );
  }
}