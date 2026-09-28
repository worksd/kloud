'use client';

import React from 'react';
import { kloudNav } from '@/app/lib/kloudNav';
import { setUserModeAction } from '@/app/admin/user.mode.action';

/**
 * '일반 모드로 가기' — 수강생이 보는 화면으로 전환.
 *
 * 바텀 탭 첫 탭이 관리자·일반 공용('/home')이라, 단순 이동으로는 관리자 폼이 또 뜬다.
 * 그래서 userMode 쿠키를 켜서 /home이 일반 홈을 그리게 한 뒤 일반 탭 구성으로 메인을 재부팅한다.
 * 다음 앱 실행(스플래시 → enterAfterAuth)에서 쿠키가 지워져 관리자 모드로 되돌아온다.
 */
export function UserModeSwitch({ label, description }: { label: string; description?: string }) {
  return (
    <div
      role={'button'}
      onClick={async () => {
        await setUserModeAction(true);
        await kloudNav.navigateMain({});
      }}
      className={'px-4 py-3.5 active:bg-[#FAFBFC] transition-colors cursor-pointer'}
    >
      <p className={'text-[15px] font-semibold text-[#4E5968]'}>{label}</p>
      {description && <p className={'text-[12px] text-[#8B95A1]'}>{description}</p>}
    </div>
  );
}
