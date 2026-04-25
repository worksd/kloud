'use server'

import { cookies } from 'next/headers';
import {
  accessTokenKey,
  fcmTokenKey,
  studioKey,
  udidKey,
  userIdKey,
} from '@/shared/cookies.key';

export async function clearCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(userIdKey);
  cookieStore.delete(udidKey);
  cookieStore.delete(fcmTokenKey);
}

export async function clearAllCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(userIdKey);
  cookieStore.delete(udidKey);
  cookieStore.delete(fcmTokenKey);
  cookieStore.delete(studioKey);
}