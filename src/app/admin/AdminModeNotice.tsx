'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { DialogClickWrapper } from '@/utils/DialogClickWrapper';

// 관리자 모드 안내 배너 — '일반 모드로 가기'(navigateMain으로 메인 재부팅. 다음 앱 실행 시엔
// 스플래시가 다시 /admin으로 보낸다)와 로그아웃(기존 Logout 다이얼로그 플로우 재사용 —
// 확인 시 디바이스 해제 + 쿠키 삭제 후 로그인 화면으로).
export function AdminModeNotice({ notice, goUserMode }: { notice: string; goUserMode: string }) {
  return (
    <div className={'mx-5 mt-6 mb-4 flex items-center justify-between gap-2.5 rounded-[16px] bg-[#1E2124] px-4 py-3.5'}>
      <span className={'text-[14px] font-semibold text-white min-w-0 truncate'}>{notice}</span>
      <div className={'shrink-0 flex items-center gap-2'}>
        <button
          type={'button'}
          onClick={() => kloudNav.navigateMain({})}
          className={'rounded-[10px] bg-white/15 px-4 py-2.5 text-[13px] font-semibold text-white active:bg-white/25 transition-colors'}
        >
          {goUserMode}
        </button>
        <DialogClickWrapper id={'Logout'}>
          <button
            type={'button'}
            aria-label={'logout'}
            className={'w-[38px] h-[38px] rounded-[10px] bg-white/15 flex items-center justify-center active:bg-white/25 transition-colors'}
          >
            <LogOut size={17} className={'text-white'}/>
          </button>
        </DialogClickWrapper>
      </div>
    </div>
  );
}
