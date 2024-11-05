import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { api } from "@/app/api.client";
import { UserStatus } from "@/entities/user/user.status";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { url } = request;
  const baseUrl = new URL('/', url).origin;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const response = await api.auth.token({});
  const userStatus = response.status;

  // if (url.endsWith('/home')) {
  //   if (userStatus == UserStatus.Ready) {
  //     return NextResponse.next()
  //   }
  //   else if (userStatus == UserStatus.New) {
  //     return NextResponse.redirect(`${baseUrl}/onboarding`);
  //   }
  //   else {
  //     return NextResponse.redirect(`${baseUrl}/login`);
  //   }
  // } else if (url.endsWith('/login')) {
  //   if (userStatus == UserStatus.New) {
  //     return NextResponse.redirect(`${baseUrl}/onboarding`);
  //   } else if (userStatus == UserStatus.Ready) {
  //     return NextResponse.redirect(`${baseUrl}/home`);
  //   } else {
  //     return NextResponse.next();
  //   }
  // }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/home'],
}