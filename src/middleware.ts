import { NextRequest, NextResponse } from 'next/server';
import { accessTokenKey } from '@/shared/cookies.key';

export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (token) {
    const response = NextResponse.next();
    response.cookies.set(accessTokenKey, token, {
      maxAge: 2592000,
      sameSite: 'lax',
    });
    return response;
  }
  return NextResponse.next();
}
