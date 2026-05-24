import { Suspense } from "react";
import Loading from "@/app/loading";
import { getAnnouncementsAction } from "@/app/announcements/get.announcements.action";
import { AnnouncementListClient } from "@/app/announcements/AnnouncementListClient";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { AnnouncementResponse } from "@/app/endpoint/announcement.endpoint";
import { NavigateMainRedirect } from "@/app/components/NavigateMainRedirect";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";
import { handleApiError } from "@/utils/handle.api.error";

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

  // 쿼리 누락/오염 — 홈으로 fallback (앱 외부 진입, 로그인 만료 후 stale link 등)
  if (!Number.isFinite(studioId)) {
    return <NavigateMainRedirect/>;
  }

  const res = await getAnnouncementsAction({ studioId, page: 1 });

  // 로그인 만료 — 로그인 화면으로
  if (isGuinnessErrorCase(res)) {
    const result = await handleApiError(res, 'GET /announcements');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect/>;
  }

  const initial: AnnouncementResponse[] = isGuinnessErrorCase(res) ? [] : res.announcements;

  return <AnnouncementListClient initial={initial} studioId={studioId}/>;
}
