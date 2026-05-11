'use server'

import { cookies } from "next/headers";
import {
  accessTokenKey,
  depositorKey,
  fcmTokenKey,
  hideDialogIdListKey,
  kioskSelectedIdKey,
  localeKey,
  studioKey,
  udidKey,
  userIdKey,
} from "@/shared/cookies.key";

export type CookiesForNative = {
  accessToken?: string;
  userID?: string;
  udid?: string;
  fcmToken?: string;
  locale?: string;
  studio?: string;
  depositor?: string;
  kioskSelectedId?: string;
  hideDialogIdList?: string;
};

/**
 * 현재 쿠키에 저장된 값들을 모아 네이티브로 보낼 페이로드를 만든다.
 * fcmToken은 httpOnly라 클라에서 못 읽으므로 server action에서 꺼내 전달.
 * 값 없는 key는 응답에서 제외 (네이티브가 빈 값 덮어쓰지 않게).
 */
export async function getCookiesForNativeAction(): Promise<CookiesForNative> {
  const c = await cookies();
  const result: CookiesForNative = {};
  const pick = (k: keyof CookiesForNative, cookieName: string) => {
    const v = c.get(cookieName)?.value;
    if (v) result[k] = v;
  };

  pick('accessToken', accessTokenKey);
  pick('userID', userIdKey);
  pick('udid', udidKey);
  pick('fcmToken', fcmTokenKey);
  pick('locale', localeKey);
  pick('studio', studioKey);
  pick('depositor', depositorKey);
  pick('kioskSelectedId', kioskSelectedIdKey);
  pick('hideDialogIdList', hideDialogIdListKey);

  return result;
}
