import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { isAuthScreen, KloudScreen } from "@/shared/kloud.screen";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { os, ua, device } = userAgent(request)
  const cookie = await cookies()
  const { appVersion, deviceId } = extractKloudInfo(ua)
  // URL 파라미터 설정
  url.searchParams.set('os', os.name ?? '')
  url.searchParams.set('appVersion', appVersion)

  // 새로운 Response 생성하면서 헤더 설정
  const response = NextResponse.rewrite(url)

  // 헤더 설정
  response.headers.set('x-guinness-client', appVersion != '' ? `${os.name}` : 'Web')
  response.headers.set('x-guinness-version', appVersion)
  response.headers.set('x-guinness-device-name', `${device.model}(${device.vendor}/${os.version})`)
  response.headers.set('x-guinness-device-id', deviceId ?? '')

  if (appVersion == '' && isAuthScreen(url.pathname) && !cookie.get(accessTokenKey)?.value) {
    const loginUrl = new URL(KloudScreen.Login(url.pathname), request.url);
    return NextResponse.redirect(loginUrl);
  }


  return response
}

function extractKloudInfo(userAgent: string): { appVersion: string; deviceId: string | null } {
  try {
    // 버전만 있는 경우와 version + deviceId 모두 커버
    const regex = /KloudNativeClient\/([0-9]+(?:\.[0-9]+)*)(?:\/([a-zA-Z0-9-]+))?/;
    const match = userAgent.match(regex);

    if (!match) {
      return {
        appVersion: '',
        deviceId: '',
      };
    }

    const appVersion = match[1];
    const deviceId = match[2] ?? null;

    return { appVersion, deviceId };
  } catch (error) {
    return {
      appVersion: '',
      deviceId: '',
    };
  }
}
// 모든 경로에 대해 미들웨어 실행
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'  // API 라우트 포함
  ],
}