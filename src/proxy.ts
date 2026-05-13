import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'
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
import { isAuthScreen, KloudScreen } from "@/shared/kloud.screen";

// /splash 진입 시 native가 query로 넘기는 쿠키 sync 매핑
const SPLASH_COOKIE_PARAMS: Array<{ param: string; cookieKey: string; httpOnly?: boolean }> = [
  { param: 'accessToken', cookieKey: accessTokenKey },
  { param: 'userID', cookieKey: userIdKey },
  { param: 'udid', cookieKey: udidKey },
  { param: 'fcmToken', cookieKey: fcmTokenKey, httpOnly: true },
  { param: 'locale', cookieKey: localeKey },
  { param: 'studio', cookieKey: studioKey },
  { param: 'depositor', cookieKey: depositorKey },
  { param: 'kioskSelectedId', cookieKey: kioskSelectedIdKey },
  { param: 'hideDialogIdList', cookieKey: hideDialogIdListKey },
];

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const { os, ua, device } = userAgent(request)
  const cookie = await cookies()

  const appVersion = extractKloudVersion(ua) ?? ''
  const deviceId = extractKloudDeviceId(ua) ?? ''

  url.searchParams.set('os', os.name ?? '')
  url.searchParams.set('appVersion', appVersion)

  // 🔹 deviceId 필요하면 query로도 전달 가능
  if (deviceId) {
    url.searchParams.set('deviceId', deviceId)
  }

  // token query param → 쿠키 저장 후 token 제거한 URL로 redirect
  const token = url.searchParams.get('token');
  if (token) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('token');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(accessTokenKey, token, {
      maxAge: 15552000,
      sameSite: 'lax',
    });
    return response;
  }

  // /splash 진입 시 native가 query로 넘긴 쿠키 값들 → 180일 만료로 저장 후 clean URL로 redirect
  // (server component에서는 cookies().set() 불가 → middleware에서 처리)
  if (url.pathname === '/splash') {
    const found = SPLASH_COOKIE_PARAMS
      .map((m) => ({ ...m, value: url.searchParams.get(m.param) }))
      .filter((m): m is typeof m & { value: string } => !!m.value);

    if (found.length > 0) {
      const cleanUrl = new URL(request.url);
      SPLASH_COOKIE_PARAMS.forEach((m) => cleanUrl.searchParams.delete(m.param));
      const response = NextResponse.redirect(cleanUrl);
      for (const m of found) {
        response.cookies.set(m.cookieKey, m.value, {
          maxAge: COOKIE_MAX_AGE,
          sameSite: 'lax',
          ...(m.httpOnly ? { httpOnly: true } : {}),
        });
      }
      return response;
    }
  }

  const response = NextResponse.rewrite(url)

  response.headers.set(
      'x-guinness-client',
      appVersion !== '' ? `${os.name}` : 'Web'
  )
  response.headers.set('x-guinness-version', appVersion)
  response.headers.set(
      'x-guinness-device-name',
      `${device.model}(${device.vendor}/${os.version})`
  )
  response.headers.set('x-guinness-device-id', deviceId)

  // 🔹 deviceId 헤더 추가 (핵심)
  if (deviceId) {
    response.headers.set('x-guinness-device-id', deviceId)
  }

  if (
      appVersion == '' &&
      isAuthScreen(url.pathname) &&
      !cookie.get(accessTokenKey)?.value
  ) {
    const returnUrl = `${url.pathname}${url.search}`;
    const loginUrl = new URL(KloudScreen.LoginIntro(`?returnUrl=${encodeURIComponent(returnUrl)}`), request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response
}
function extractKloudVersion(userAgent: string): string | null {
  try {
    // kloudNativeClient/ 다음에 오는 버전 번호를 찾습니다
    const regex = /KloudNativeClient\/([0-9]+(?:\.[0-9]+)*)/;
    const match = userAgent.match(regex);

    if (!match) {
      return null;
    }

    return match[1]; // 버전 번호만 반환 (예: "1.0.1")
  } catch (error) {
    return null;
  }
}

function extractKloudDeviceId(userAgent: string): string | null {
  try {
    // KloudNativeClient/{version}/{deviceId}
    const regex = /KloudNativeClient\/[0-9]+(?:\.[0-9]+)*\/([A-Za-z0-9-]+)/;
    const match = userAgent.match(regex);

    if (!match) {
      return null;
    }

    return match[1];
  } catch {
    return null;
  }
}
// 모든 경로에 대해 proxy 실행
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'  // API 라우트 포함
  ],
}
