import { Suspense } from "react";
import Loading from "@/app/loading";
import { getAnnouncementsAction } from "@/app/announcements/get.announcements.action";
import { AnnouncementListClient } from "@/app/announcements/AnnouncementListClient";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { AnnouncementResponse } from "@/app/endpoint/announcement.endpoint";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ studioId?: string }>;
}) {
  return (
    <Suspense fallback={<Loading/>}>
      <AnnouncementsServer searchParams={searchParams}/>
    </Suspense>
  );
}

async function AnnouncementsServer({
  searchParams,
}: {
  searchParams: Promise<{ studioId?: string }>;
}) {
  const params = await searchParams;
  const studioId = Number(params.studioId);

  if (!Number.isFinite(studioId)) {
    return (
      <div className={'w-full min-h-screen bg-white flex items-center justify-center text-[14px] text-[#8B95A1]'}>
        잘못된 접근입니다
      </div>
    );
  }

  const res = await getAnnouncementsAction({ studioId, page: 1 });
  const initial: AnnouncementResponse[] = isGuinnessErrorCase(res) ? [] : res.announcements;

  return <AnnouncementListClient initial={initial} studioId={studioId}/>;
}
