import { NextRequest, userAgent } from 'next/server'
import { NextResponse } from 'next/server'
import { api } from "@/app/api.client";
import { UserStatus } from "@/entities/user/user.status";
import { cookies } from "next/headers";
import { accessTokenKey, userIdKey } from "@/shared/cookies.key";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { os } = userAgent(request)
  url.searchParams.set('os', os.name ?? '')
  return NextResponse.rewrite(url)
}
// 모든 경로에 대해 미들웨어 실행
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}