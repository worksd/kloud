'use server'

import { api } from "@/app/api.client";

// WebTopNav(PC 웹 상단바) 프로필 표시용 — 최소 필드만 추린다.
// 미로그인/실패는 null: 상단바는 로그인 버튼으로 폴백하면 그만이라 에러를 밖으로 던지지 않는다.
export const getWebTopNavProfileAction = async () => {
  try {
    const res = await api.user.me({});
    if (res && typeof res === 'object' && 'id' in res) {
      const u = res as { nickName?: string; name?: string; profileImageUrl?: string };
      return { nickName: u.nickName, name: u.name, profileImageUrl: u.profileImageUrl };
    }
    return null;
  } catch {
    return null;
  }
};
