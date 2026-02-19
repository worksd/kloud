'use server';

import { cookies } from 'next/headers';
import { accessTokenKey } from '@/shared/cookies.key';

export async function saveTokenFromParams(searchParams: Promise<{ token?: string; [key: string]: string | undefined }>) {
  const params = await searchParams;
  if (params.token) {
    const cookie = await cookies();
    cookie.set(accessTokenKey, params.token, {
      maxAge: 2592000,
      sameSite: 'lax',
    });
  }
}
