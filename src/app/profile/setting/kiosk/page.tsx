'use server';

import {getMeAction} from "@/app/profile/setting/kiosk/get.me.action";
import {KioskForm} from "@/app/profile/setting/kiosk/KioskForm";

export default async function KioskPage() {
  const res = await getMeAction()
  if ('id' in res && res.studio?.id) {
    return (
        <KioskForm
            studioId={res.studio?.id}/>
    )
  } else {
    throw Error('not kiosk user')
  }
}
