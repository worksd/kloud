import React from "react";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NoMyStudioPage } from "@/app/home/NoMyStudioPage";
import { getHomeAction } from "@/app/home/get.home.action";

export default async function SchedulePage() {
  const res = await getHomeAction();

  if (!('studios' in res)) return null;

  if (!res.myStudio) {
    return (
      <div className="bg-white min-h-screen">
        <NoMyStudioPage studios={res.recommendedStudios} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-4 pb-20">
      <TimeTableServerComponent studioId={res.myStudio.studio.id} />
    </div>
  );
}
