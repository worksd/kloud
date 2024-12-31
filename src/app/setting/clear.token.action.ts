'use server'

import { cookies } from 'next/headers';
import { accessTokenKey, userIdKey } from '@/shared/cookies.key';

export async function clearToken() {
  const cookieStore = cookies();
  
  // 서버 사이드에서 쿠키 삭제
  cookieStore.delete(accessTokenKey);
  cookieStore.delete(userIdKey);
  
  // 또는 만료된 쿠키로 덮어쓰기
  cookieStore.set(accessTokenKey, '', {
    expires: new Date(0),
    path: '/',
    sameSite: 'lax'
  });
  
  cookieStore.set(userIdKey, '', {
    expires: new Date(0),
    path: '/',
    sameSite: 'lax'
  });

  return { success: true };
} 