'use server'

import { cookies } from 'next/headers';
import { accessTokenKey, userIdKey } from '@/shared/cookies.key';

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(userIdKey);
  console.log("----------------Clear Token-------------------")
} 