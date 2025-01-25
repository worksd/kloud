import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { os, ua, device } = userAgent(request)

  // URL 파라미터 설정
  url.searchParams.set('os', os.name ?? '')

  console.log(userAgent(request))

  // 새로운 Response 생성하면서 헤더 설정
  const response = NextResponse.rewrite(url)

  // 헤더 설정
  response.headers.set('x-guinness-client', `${os.name}`)
  response.headers.set('x-guinness-version', extractKloudVersion(ua) ?? '')
  response.headers.set('x-guinness-device-name', `${device.model}(${device.vendor}/${os.version})`)

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
    console.error('Failed to extract Kloud version:', error);
    return null;
  }
}
// 모든 경로에 대해 미들웨어 실행
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}