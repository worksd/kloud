'use server'

import { cookies } from 'next/headers';
import { accessTokenKey, udidKey, userIdKey } from '@/shared/cookies.key';

export async function clearCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(userIdKey);
  cookieStore.delete(udidKey);
  console.log("----------------Clear Token-------------------")
} 