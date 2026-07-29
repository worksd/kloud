'use server';

import { cookies } from 'next/headers';
import { KioskBootstrap } from '@/app/kiosk/KioskBootstrap';
import { accessTokenKey, kioskSelectedIdKey } from '@/shared/cookies.key';

// 상담실 태블릿(admin 모드) 전용 라우트.
// 로그인·키오스크 선택은 /kiosk와 공유하며, 선택한 키오스크 mode가 'admin'이면
// KioskBootstrap이 이 경로로 자동 리다이렉트한다.
export default async function KioskAdminPage({ searchParams }: {
  searchParams: Promise<{ token?: string; step?: string }>
}) {
  const { token: urlToken } = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenKey)?.value;
  const selectedKioskIdStr = cookieStore.get(kioskSelectedIdKey)?.value;
  const initialKioskId = selectedKioskIdStr ? Number(selectedKioskIdStr) : undefined;

  return (
    <KioskBootstrap
      route="admin"
      urlToken={urlToken}
      hasInitialToken={!!accessToken}
      initialKioskId={initialKioskId}
    />
  );
}
