'use server'

import { cookies } from "next/headers";
import {
  accessTokenKey,
  COOKIE_MAX_AGE,
  depositorKey,
  fcmTokenKey,
  hideDialogIdListKey,
  kioskSelectedIdKey,
  localeKey,
  studioKey,
  udidKey,
  userIdKey,
} from "@/shared/cookies.key";

export type CookieSyncFromNativePayload = Partial<{
  accessToken: string;
  userID: string;
  udid: string;
  fcmToken: string;
  locale: string;
  studio: string;
  depositor: string;
  kioskSelectedId: string;
  hideDialogIdList: string;
}>;

/**
 * 네이티브 앱이 splash 진입 시 query로 넘긴 쿠키 값들을 동기화한다.
 * - 값이 있는 키만 set (undefined/'' 인 키는 건드리지 않음 → 기존 값 보존)
 * - 모든 키 만료는 180일로 통일 (네이티브가 다시 sync 호출하면 그때 재갱신)
 * - fcmToken만 httpOnly 유지
 */
export async function syncCookiesFromNativeAction(payload: CookieSyncFromNativePayload) {
  const hasAny = Object.values(payload).some((v) => v !== undefined && v !== '');
  if (!hasAny) return;

  const cookieStore = await cookies();
  const set = (
    key: string,
    value: string | undefined,
    extra: { httpOnly?: boolean } = {},
  ) => {
    if (!value) return;
    cookieStore.set(key, value, {
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      ...extra,
    });
  };

  set(accessTokenKey, payload.accessToken);
  set(userIdKey, payload.userID);
  set(udidKey, payload.udid);
  set(fcmTokenKey, payload.fcmToken, { httpOnly: true });
  set(localeKey, payload.locale);
  set(studioKey, payload.studio);
  set(depositorKey, payload.depositor);
  set(kioskSelectedIdKey, payload.kioskSelectedId);
  set(hideDialogIdListKey, payload.hideDialogIdList);
}
