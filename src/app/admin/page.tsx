import React from 'react';
import { redirect } from 'next/navigation';
import { api } from '@/app/api.client';
import { UserType } from '@/entities/user/user.type';
import { AdminHomeForm } from '@/app/admin/AdminHomeForm';

// 관리자(Partner/Operator) 전용 홈 — 직접 진입(/admin) 경로.
// 바텀 탭의 첫 탭은 '/home'을 쓰고 그쪽에서 같은 AdminHomeForm을 렌더한다
// (첫 탭 route를 /admin으로 주면 앱 부팅 시 흰 화면이 되는 이슈 때문).
export default async function AdminHomePage() {
  // 가드 — 토큰 검사(GET /auth)의 user.type. 관리자가 아니면(비로그인 포함) 일반 홈으로.
  const auth = await api.auth.token({});
  const isAdminUser = 'id' in auth && (auth.type === UserType.Partner || auth.type === UserType.Operator);
  if (!isAdminUser) redirect('/home');

  return <AdminHomeForm/>;
}
