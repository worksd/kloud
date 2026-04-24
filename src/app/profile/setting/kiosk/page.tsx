'use server';

import {getMeAction} from "@/app/profile/setting/kiosk/get.me.action";
import {KioskForm} from "@/app/profile/setting/kiosk/KioskForm";
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
        />
      );
    }
  }

  const res = await getMeAction();
  if ('id' in res && res.studio?.id) {
    return (
      <KioskForm
        studioId={res.studio.id}
        studioName={res.studio.name ?? ''}
        studioProfileImageUrl={res.studio.profileImageUrl}
        kioskImageUrl={res.studio.kioskImageUrl}
      />
    );
  }

  throw Error('not kiosk user');
}
