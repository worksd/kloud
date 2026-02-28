'use server';

import {getMeAction} from "@/app/profile/setting/kiosk/get.me.action";
import {QRLessonSelectForm} from "@/app/profile/setting/qr-scanner/QRLessonSelectForm";

export default async function QRScannerPage() {
  const res = await getMeAction()
  if ('id' in res && res.studio?.id) {
    return (
      <QRLessonSelectForm
        studioId={res.studio.id}
        studioName={res.studio.name ?? ''}
      />
    )
  } else {
    throw Error('not qr scanner user')
  }
}
