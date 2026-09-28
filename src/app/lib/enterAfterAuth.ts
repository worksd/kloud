'use client';

import { UserType } from "@/entities/user/user.type";
import { kloudNav } from "@/app/lib/kloudNav";
import { setUserModeAction } from "@/app/admin/user.mode.action";

/**
 * 인증 통과 후 진입 분기 — 관리자(Partner/Operator)는 바텀 탭 메인 대신 관리자 전용 홈으로.
 *
 * 스플래시뿐 아니라 로그인·회원가입 직후에도 같은 규칙을 타야 하므로 여기 한 곳에 모은다.
 * route(딥링크 등 목적지가 정해진 경우)가 있으면 목적지가 명확하니 관리자도 기존 메인 플로우를 쓴다.
 */
export const enterAfterAuth = async ({ type, route }: { type?: UserType | string, route?: string }) => {
  const isAdmin = type === UserType.Partner || type === UserType.Operator;
  if (!route && isAdmin) {
    // 앱을 새로 켰으니 '일반 모드'는 해제 — 첫 탭(/home)이 다시 관리자 폼을 그린다.
    await setUserModeAction(false);
    // 관리자 탭(홈·매출·수강생·설정) 구성으로 메인 재부팅.
    // route 는 넘기지 않는다 — 네이티브가 route 를 받으면 그 화면을 탭 위에 풀스크린으로 push 해서
    // 바텀 내비가 가려진다. 첫 화면은 첫 탭(ADMIN_HOME=/home)이 맡는다.
    await kloudNav.navigateMain({ admin: true });
    return;
  }
  await kloudNav.navigateMain(route ? { route } : {});
};
