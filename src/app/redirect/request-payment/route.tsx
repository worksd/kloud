// app/redirect/request-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/app/api.client'
import { COUNTRIES } from '@/app/certification/COUNTRIES'
import { accessTokenKey, userIdKey } from '@/shared/cookies.key'
import {getDynamicCommon} from "@/app/redirect/request-payment/get.common.action";
import {redirect} from "next/navigation";
import {KloudScreen} from "@/shared/kloud.screen";

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const phone = url.searchParams.get('phone') ?? ''
  const countryCode = url.searchParams.get('countryCode') ?? 'KR'
  const redirectUrl = url.searchParams.get('redirectUrl') ?? '/'
  const itemId = url.searchParams.get('itemId')
  const targetUserId = url.searchParams.get('targetUserId')

  const dial = COUNTRIES.find(v => v.key === countryCode)?.dial ?? '82'

  if (itemId) {
    console.log(url.searchParams)
    const res = await getDynamicCommon({ path: `/tickets/duplicate-check?userId=${targetUserId}&lessonId=${itemId}`})
    if ('id' in res) {
      redirect(KloudScreen.TicketDetail(res.id, false))
    }
  }

  const res = await api.auth.checkPhoneVerification({
    phone, countryCode: dial, isAdmin: true
  })

  const response = NextResponse.redirect(new URL(redirectUrl, url.origin))

  if ('user' in res) {
    response.cookies.set(accessTokenKey, res.accessToken, {
      maxAge: 2592000,
      sameSite: 'lax',
    })
    response.cookies.set(userIdKey, String(res.user.id), {
      maxAge: 2592000,
      sameSite: 'lax',
    })
  } else {
    // 실패 시 홈으로
    return NextResponse.redirect(new URL('/', url.origin))
  }

  return response
}