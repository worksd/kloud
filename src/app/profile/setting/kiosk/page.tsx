'use server';

import {getMeAction} from "@/app/profile/setting/kiosk/get.me.action";
import {KioskForm} from "@/app/profile/setting/kiosk/KioskForm";
import {saveTokenFromParams} from "@/utils/saveTokenFromParams";

export default async function KioskPage({searchParams}: { searchParams: Promise<{ token?: string }> }) {
  await saveTokenFromParams(searchParams);
  const res = await getMeAction()
  if ('id' in res && res.studio?.id) {
    return (
        <KioskForm
            studioId={res.studio?.id}
            studioName={res.studio?.name ?? ''}
            studioProfileImageUrl={res.studio?.profileImageUrl}
            kioskImageUrl={res.studio?.kioskImageUrl}/>
    )
  } else {
    throw Error('not kiosk user')
  }
}
