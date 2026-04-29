'use server';

import { cookies } from 'next/headers';
import { KioskBootstrap } from '@/app/kiosk/KioskBootstrap';
import { accessTokenKey, kioskSelectedIdKey } from '@/shared/cookies.key';

export default async function KioskPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenKey)?.value;
  const selectedKioskIdStr = cookieStore.get(kioskSelectedIdKey)?.value;
  const initialKioskId = selectedKioskIdStr ? Number(selectedKioskIdStr) : undefined;

  return (
    <KioskBootstrap
      hasInitialToken={!!accessToken}
      initialKioskId={initialKioskId}
    />
  );
}
