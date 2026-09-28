'use server'

import { redirect } from 'next/navigation';
import { api } from '@/app/api.client';
import { UserType } from '@/entities/user/user.type';

/**
 * 관리자(Partner/Operator) 전용 화면 가드 — 관리자 홈(page.tsx)과 같은 규칙.
 * 관리자가 아니면(비로그인 포함) 일반 홈으로 보낸다. 통과하면 학원 이름을 돌려준다.
 */
export const requireAdmin = async (): Promise<{ studioName?: string; studioId?: number; studioImageUrl?: string; adminName?: string }> => {
  const auth = await api.auth.token({});
  const isAdmin = 'id' in auth && (auth.type === UserType.Partner || auth.type === UserType.Operator);
  if (!isAdmin) redirect('/home');

  const me = await api.user.me({});
  if (!('id' in me)) return {};
  return {
    studioName: me.studio?.name,
    studioId: me.studio?.id,
    studioImageUrl: me.studio?.profileImageUrl,
    adminName: me.nickName ?? me.name ?? undefined,
  };
};
