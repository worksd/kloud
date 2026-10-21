'use client';

import React from 'react';
import { kloudNav } from '@/app/lib/kloudNav';
import { LoginGradientBlobs } from '@/app/login/loginWebDecor';

// 공통 에러 화면 — 페이지 조회가 도메인 에러(code+message)로 실패했을 때 빨간 글씨 대신 노출.
// 브랜드 톤: 흰 바탕 + 로그인 웹과 같은 파스텔 블롭, Paperlogy 제목, 검은 둥근 버튼.
// 버튼은 '홈으로' — 뒤로가기는 직접 진입(공유 링크)이면 돌아갈 곳이 없어서 홈이 안전하다.
// 앱은 navigateMain(메인 재부팅)으로, 웹은 kloudNav 폴백이 '/'로 replace 한다.
// children 슬롯에 화면별 부가 정보(예: 결제 충돌 수업 목록)를 끼워 넣는다.
export function ErrorView({ title, message, homeLabel, children }: {
  title: string;
  /** 본문 — 서버 메시지가 제목으로 올라간 경우엔 비운다 */
  message?: string;
  homeLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col">
      <LoginGradientBlobs/>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* 브랜드 마크 — 로고 대신 서체로. 그라데이션 테두리 원 안에 느낌표 */}
        <div
          className="w-[88px] h-[88px] rounded-full p-[2px] mb-8"
          style={{ background: 'linear-gradient(135deg, #8AB4FF 0%, #E3A6FF 50%, #8FE8D2 100%)' }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="font-paperlogy text-[40px] leading-none text-[#191F28] translate-y-[1px]">!</span>
          </div>
        </div>

        <h1 className="font-paperlogy text-[26px] leading-[1.25] text-[#191F28] tracking-[-0.6px] whitespace-pre-line">
          {title}
        </h1>
        {message && (
          <p className="mt-3 text-[15px] leading-relaxed text-[#6B7684] tracking-[-0.2px] whitespace-pre-line max-w-[320px]">
            {message}
          </p>
        )}

        {children}

        <button
          type="button"
          onClick={() => kloudNav.navigateMain({})}
          className="mt-10 w-full max-w-[320px] h-[56px] rounded-2xl bg-[#191F28] text-white text-[16px] font-bold tracking-[-0.2px] active:scale-[0.98] transition-transform"
        >
          {homeLabel}
        </button>
      </div>
    </div>
  );
}
