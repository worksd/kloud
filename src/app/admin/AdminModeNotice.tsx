'use client';

import React from 'react';
import { kloudNav } from '@/app/lib/kloudNav';

// 관리자 모드 안내 배너 + '일반 모드로 가기' — navigateMain으로 메인(바텀 탭) 재부팅.
// 다음 앱 실행 시엔 스플래시가 다시 관리자 모드(/admin)로 보낸다.
export function AdminModeNotice({ notice, goUserMode }: { notice: string; goUserMode: string }) {
  return (
    <div className={'mx-5 mt-6 mb-4 flex items-center justify-between gap-3 rounded-[16px] bg-[#1E2124] px-4 py-3.5'}>
      <span className={'text-[14px] font-semibold text-white min-w-0 truncate'}>{notice}</span>
      <button
        type={'button'}
        onClick={() => kloudNav.navigateMain({})}
        className={'shrink-0 rounded-[10px] bg-white/15 px-4 py-2.5 text-[13px] font-semibold text-white active:bg-white/25 transition-colors'}
      >
        {goUserMode}
      </button>
    </div>
  );
}
