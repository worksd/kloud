// app/redirect/route.ts
// QR/외부 링크 진입점 — type 파라미터로 분기하여 적절한 화면으로 redirect
// 예: https://rawgraphy.com/redirect?code=ABCD123456&type=UseVoucher
import { NextRequest, NextResponse } from 'next/server'
import { KloudScreen } from '@/shared/kloud.screen'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const code = url.searchParams.get('code') ?? ''

  switch (type) {
    case 'UseVoucher': {
      const target = new URL(KloudScreen.CouponRegister, url.origin)
      if (code) target.searchParams.set('code', code)
      return NextResponse.redirect(target)
    }
    default:
      return NextResponse.redirect(new URL('/', url.origin))
  }
}
