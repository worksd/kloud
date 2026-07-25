'use client';

import React from 'react';

// 키오스크 전 스텝 공통 상단 바 규격.
// 좌: 뒤로가기(옵션) · 중앙: 타이틀(옵션) · 우: 홈(옵션).
// 높이/패딩/폰트/아이콘 크기를 한 규격으로 통일 — 스텝마다 헤더가 달라 보이지 않도록.
// 언어 설정은 홈 화면에서만 가능하다 — 하위 스텝 상단 바에는 언어 피커를 두지 않는다.
export const KioskTopBar = ({ title, onBack, onHome }: {
  title?: string;
  onBack?: () => void;
  onHome?: () => void;
}) => {
  return (
    <div className="relative shrink-0 flex items-center justify-between pr-[5.6%] h-[min(7vh,72px)]">
      {/* 좌측 — 뒤로가기 (없으면 빈 공간, 타이틀은 절대중앙이라 유지됨) */}
      {onBack ? (
        <button
          onClick={onBack}
          className="ml-[min(1.6vw,18px)] w-[min(5.6vh,64px)] h-[min(5.6vh,64px)] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ic_back_arrow.svg" alt="" className="w-[min(4.4vh,48px)] h-[min(4.4vh,48px)]" />
        </button>
      ) : (
        <span className="ml-[min(1.6vw,18px)] w-[min(5.6vh,64px)]" />
      )}

      {/* 중앙 — 타이틀 */}
      {title && (
        <p className="absolute left-1/2 -translate-x-1/2 text-[#1E2124] text-[min(2.6vh,26px)] font-bold pointer-events-none whitespace-nowrap">
          {title}
        </p>
      )}

      {/* 우측 — 홈. 얇은 선 아이콘 대신 회색 원형 칩 + 솔리드 하우스 (날짜/탭 pill과 같은 형태 언어) */}
      {onHome ? (
        <button
          onClick={onHome}
          aria-label="home"
          className="rounded-full bg-[#F2F4F6] flex items-center justify-center active:scale-[0.96] transition-transform"
          style={{ width: 'min(5.2vh, 54px)', height: 'min(5.2vh, 54px)' }}
        >
          <svg viewBox="0 0 24 24" fill="#4E5968" style={{ width: '50%', height: '50%' }}>
            <path d="M12 3.05c.36 0 .71.13.99.37l6.9 5.83c.4.34.63.84.63 1.36v7.97c0 1.23-1 2.22-2.22 2.22h-2.96v-4.87c0-.79-.64-1.43-1.43-1.43h-1.82c-.79 0-1.43.64-1.43 1.43V20.8H7.7c-1.23 0-2.22-.99-2.22-2.22v-7.97c0-.52.23-1.02.63-1.36l6.9-5.83c.28-.24.63-.37.99-.37Z" />
          </svg>
        </button>
      ) : (
        <span style={{ width: 'min(5.2vh, 54px)' }} />
      )}
    </div>
  );
};
