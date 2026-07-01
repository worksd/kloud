// app/redirect/route.ts
// QR/외부 링크 진입점 — type 파라미터로 분기하여 적절한 화면으로 redirect
// 예: https://rawgraphy.com/redirect?code=ABCD123456&type=UseVoucher
import { NextRequest, NextResponse } from 'next/server'
import { resolveRedirectTarget } from '@/app/redirect/resolve'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const code = url.searchParams.get('code')
  // 브라우저/QR 진입 — 최종 경로로 서버 리다이렉트. (앱 딥링크는 splash에서 직접 해석)
  return NextResponse.redirect(new URL(resolveRedirectTarget(type, code), url.origin))
}
