import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers";
import {
  accessTokenKey,
  COOKIE_MAX_AGE,
  depositorKey,
  fcmTokenKey,
  kioskSelectedIdKey,
  localeKey,
  studioKey,
  udidKey,
  userIdKey,
} from "@/shared/cookies.key";
import { isAuthScreen, KloudScreen } from "@/shared/kloud.screen";

// /home 진입 시 만료를 갱신할 쿠키 목록. 활성 사용자는 사실상 무기한 유지.
// hideDialogIdList는 의도적으로 90일 만료라 제외.
const COOKIES_TO_REFRESH: Array<{ key: string; httpOnly?: boolean }> = [
  { key: accessTokenKey },
  { key: userIdKey },
  { key: udidKey },
  { key: fcmTokenKey, httpOnly: true },
  { key: localeKey },
  { key: studioKey },
  { key: depositorKey },
  { key: kioskSelectedIdKey },
];

// This function can be marked `async` if using `await` inside
// Apple Universal Links (AASA) — 도메인별로 앱 번들ID를 다르게 서빙.
// - prod 도메인 → prod 앱만. (dev 번들이 prod로 새면 안 됨)
// - staging → dev + prod 둘 다. prod 앱을 staging 서버로 붙여 QA하는 경우도 링크가 걸려야 하므로.
//   staging에 prod 번들을 넣는 건 안전(막고 싶은 건 dev→prod 유출뿐).
//   순서(배열 우선순위): 둘 다 설치된 기기에선 dev 앱이 잡히도록 dev를 먼저 둔다.
// 정적 파일 하나로는 브랜치 머지 시 섞이므로 Host 기준으로 동적 응답한다.
const APPLE_TEAM_ID = 'AWMR6W6KV4';
const buildAasa = (host: string) => {
  const prod = { appID: `${APPLE_TEAM_ID}.com.worksd.krush`, paths: ['*'] };
  const dev = { appID: `${APPLE_TEAM_ID}.com.worksd.krush.dev`, paths: ['*'] };
  const details = host.startsWith('staging.') ? [dev, prod] : [prod];
  return { applinks: { apps: [], details } };
};

export async function proxy(request: NextRequest) {
  const url = request.nextUrl

  // AASA는 라우팅/인증 로직을 타기 전에 Host 기반으로 즉시 응답 (200 + application/json, redirect 없이)
  if (url.pathname === '/.well-known/apple-app-site-association') {
    return NextResponse.json(buildAasa(request.headers.get('host') ?? ''));
  }

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

  const response = NextResponse.rewrite(url)

  // /home 진입마다 보유 중인 쿠키들의 만료를 365일로 갱신.
  // 값이 없는 키는 건너뜀 (새로 생성하지 않음).
  if (url.pathname === '/home') {
    for (const { key, httpOnly } of COOKIES_TO_REFRESH) {
      const v = cookie.get(key)?.value;
      if (!v) continue;
      response.cookies.set(key, v, {
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
        ...(httpOnly ? { httpOnly: true } : {}),
      });
    }
  }

  // 키오스크 페이지(/kiosk 및 하위 경로)는 KIOSK로 고정. 그 외는 OS 이름 / Web.
  // server action 호출도 같은 pathname으로 들어오므로 자동 적용됨.
  const guinnessClient = url.pathname.startsWith('/kiosk')
    ? 'KIOSK'
    : (appVersion !== '' ? `${os.name}` : 'Web');
  response.headers.set('x-guinness-client', guinnessClient)
  response.headers.set('x-guinness-version', appVersion)
  response.headers.set(
      'x-guinness-device-name',
      `${device.model}(${device.vendor}/${os.version})`
  )
  response.headers.set('x-guinness-device-id', deviceId)

  // API를 보낸 현재 경로(진입 페이지). 서버 액션도 페이지 pathname으로 들어오므로 동일하게 잡힘.
  response.headers.set('x-guinness-entry', url.pathname)

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
