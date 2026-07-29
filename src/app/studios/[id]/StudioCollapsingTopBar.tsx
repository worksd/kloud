'use client'

import React, { useEffect, useState } from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

// 스튜디오 상세 collapsing 헤더 — 최상단이면 배경 없이 백버튼만(이미지 위),
// 커버 이미지를 지나 스크롤하면 흰 탑바 + 프로필 로고·제목이 페이드 인(백버튼도 검정으로).
// 웹(appVersion === '')은 상태바가 없고 백버튼도 안 띄우므로 상단 패딩을 줄인다.
export function StudioCollapsingTopBar({ title, appVersion, profileImageUrl }: {
  title: string;
  appVersion: string;
  /** 탑바 제목 왼쪽에 붙는 작은 원형 로고 */
  profileImageUrl?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.studio-detail-container') as HTMLElement | null;
    if (!container) return;
    const cover = document.querySelector('.studio-cover') as HTMLElement | null;
    const onScroll = () => {
      // 커버가 거의 다 스크롤되면 collapse (탑바 높이만큼 여유)
      const threshold = Math.max((cover?.offsetHeight ?? 240) - 64, 0);
      setCollapsed(container.scrollTop >= threshold);
    };
    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-30 flex items-center gap-1.5 px-2 pb-3 transition-colors duration-200
        ${appVersion !== '' ? 'pt-11' : 'pt-3'}
        ${collapsed ? 'bg-white/95 backdrop-blur-sm border-b border-[#F1F3F6]' : 'bg-transparent border-b border-transparent'}`}
    >
      {appVersion !== '' && (
        <NavigateClickWrapper method="back">
          <button
            type="button"
            aria-label="뒤로가기"
            className={`inline-flex h-11 w-11 items-center justify-center shrink-0 ${
              collapsed ? 'text-[#191F28]' : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]'
            }`}
          >
            {/* 꼬리 달린 화살표(left-arrow) 대신 꺽새. 원본 10×18 비율 유지 + currentColor로 색 반영 */}
            <svg viewBox="0 0 10 18" fill="none" className="h-[19px] w-[11px] block">
              <path
                d="M8.675 17.475C8.375 17.475 8.075 17.375 7.875 17.075L0.375 9.575C-0.125 9.075 -0.125 8.375 0.375 7.875L7.875 0.375C8.375 -0.125 9.075 -0.125 9.575 0.375C10.075 0.875 10.075 1.575 9.575 2.075L2.775 8.775L9.475 15.475C9.975 15.975 9.975 16.675 9.475 17.175C9.275 17.375 8.975 17.475 8.675 17.475Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </NavigateClickWrapper>
      )}

      {/* 프로필 로고 + 스튜디오명 — collapse 시 함께 페이드 인 */}
      <div
        className={`flex min-w-0 items-center gap-2 transition-opacity duration-200
          ${collapsed ? 'opacity-100' : 'opacity-0'}`}
      >
        {profileImageUrl && (
          <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#F1F3F6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
          </span>
        )}
        <span className="min-w-0 truncate text-[18px] font-bold text-[#131517]">{title}</span>
      </div>
    </div>
  );
}
