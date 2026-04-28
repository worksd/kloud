'use server';

import {getMeAction} from "@/app/kiosk/get.me.action";
import {KioskForm} from "@/app/kiosk/KioskForm";
import {getStudioDetail} from "@/app/studios/[id]/studio.detail.action";

export default async function KioskPage({searchParams}: {
  searchParams: Promise<{ studioId?: string }>
}) {
  const {studioId} = await searchParams;

  if (studioId) {
    const studio = await getStudioDetail(Number(studioId));
    if ('id' in studio) {
      return (
        <KioskForm
          studioId={studio.id}
          studioName={studio.name}
          studioProfileImageUrl={studio.profileImageUrl}
          kioskImageUrl={studio.kioskImageUrl}
          passPlans={studio.passPlans ?? []}
        />
      );
    }
  }

  const res = await getMeAction();
  if ('id' in res && res.studio?.id) {
    const studio = await getStudioDetail(res.studio.id);
    return (
      <KioskForm
        studioId={res.studio.id}
        studioName={res.studio.name ?? ''}
        studioProfileImageUrl={res.studio.profileImageUrl}
        kioskImageUrl={res.studio.kioskImageUrl}
        passPlans={'id' in studio ? (studio.passPlans ?? []) : []}
      />
    );
  }

  // [DEV] 키오스크 계정/스튜디오 식별 실패 시 14번 스튜디오로 폴백
  const fallbackStudio = await getStudioDetail(14);
  if ('id' in fallbackStudio) {
    return (
      <KioskForm
        studioId={fallbackStudio.id}
        studioName={fallbackStudio.name}
        studioProfileImageUrl={fallbackStudio.profileImageUrl}
        kioskImageUrl={fallbackStudio.kioskImageUrl}
        passPlans={fallbackStudio.passPlans ?? []}
      />
    );
  }

  throw Error('not kiosk user');
}
