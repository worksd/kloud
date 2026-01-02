import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { isAuthScreen, KloudScreen } from "@/shared/kloud.screen";

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
    const loginUrl = new URL(KloudScreen.Login(url.pathname), request.url);
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
