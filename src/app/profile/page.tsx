import { api } from "@/app/api.client";
import { TrackView } from "@/app/components/TrackView";
import React from "react";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";
import { getLocale } from "@/utils/translate";
import { ProfileForm } from "@/app/profile/ProfileForm";
import { ProfilePcForm } from "@/app/profile/ProfilePcForm";
import { ProfileTabKey } from "@/app/profile/ProfilePcClient";

const PC_TABS: ProfileTabKey[] = ['home', 'tickets', 'pass', 'payments', 'bookings'];

export default async function ProfilePage({searchParams}: {
  searchParams: Promise<{ os?: string, appVersion?: string, tab?: string }>
}) {
  const { appVersion, tab } = await searchParams;
  // 상단바 드롭다운 등에서 ?tab=tickets 식으로 특정 탭을 바로 열 수 있게
  const initialTab = PC_TABS.includes(tab as ProfileTabKey) ? (tab as ProfileTabKey) : undefined;
  const user = await api.user.me({})

  if (!('id' in user)) {
    const result = await handleApiError(user, 'GET /users/me');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }

  const locale = await getLocale();
  // 웹 직접 접근 + viewport ≥1024px(lg)이면 PC 사이드바 레이아웃, 그 외(앱 웹뷰/좁은 웹)는 기존 렌더.
  // 서버는 viewport를 모르므로 둘 다 SSR 렌더 후 CSS로 토글 (마이패스/결제내역 상세와 동일 패턴).
  const isWeb = appVersion === '' || appVersion == null;

  return (
    <>
      <TrackView event="enter_profile"/>
      {isWeb ? (
        <>
          <div className="hidden lg:block">
            <ProfilePcForm user={user} locale={locale} initialTab={initialTab}/>
          </div>
          <div className="lg:hidden">
            <ProfileForm user={user} locale={locale}/>
          </div>
        </>
      ) : (
        <ProfileForm user={user} locale={locale}/>
      )}
    </>
  );
}
